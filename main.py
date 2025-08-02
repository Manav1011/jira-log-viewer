"""
FastAPI replacement for the previous Node/Express server.

It serves the OAuth landing page (index.html) and, once Atlassian redirects
back with a `?code=` query parameter, performs the same token exchange + Jira
work-log lookup as the original implementation.
"""

import json
import os
from pathlib import Path
from datetime import datetime

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response, status, Query, Header
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# === Config ===
# If you still want to keep the OAuth flow, leave these here. Currently the
# front-end talks to Jira via personal API token through the proxy route below.
CLIENT_ID = os.getenv("CLIENT_ID", "yuyKoUDdXh7VLYCBP8w30ZhQwfXw8h2d")
CLIENT_SECRET = os.getenv("CLIENT_SECRET", "YOUR_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5000"  # OAuth callback goes to backend

# Default Jira base URL if the client does not provide one (can be overridden
# per-request via the `jira_url` query parameter).
DEFAULT_JIRA_URL = os.getenv("JIRA_URL_DEFAULT", "https://webelight.atlassian.net")

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"  # Built React app directory
index_file = DIST_DIR / "index.html"

app = FastAPI()

# Mount static files from the built React app
app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="static")

# Remove CORS middleware since we're serving everything from the same origin
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5000"],  # Same origin now
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE"],
#     allow_headers=["*"],
# )


# ---------------------------------------------------------------------------
#  Front-end entry: serve the SPA page
# ---------------------------------------------------------------------------

@app.get("/")
async def root(request: Request):
    """Entry point.
    • If Atlassian redirected with ?code=… → exchange code, set cookies, redirect.
    • Otherwise serve the SPA.
    """
    code = request.query_params.get("code")
    if code:
        # ---- OAuth callback ----
        try:
            async with httpx.AsyncClient() as client:
                token_resp = await client.post(
                    "https://auth.atlassian.com/oauth/token",
                    json={
                        "grant_type": "authorization_code",
                        "client_id": CLIENT_ID,
                        "client_secret": CLIENT_SECRET,
                        "code": code,
                        "redirect_uri": REDIRECT_URI,
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=20,
                )
                token_resp.raise_for_status()
                access_token = token_resp.json()["access_token"]

                resources_resp = await client.get(
                    "https://api.atlassian.com/oauth/token/accessible-resources",
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=20,
                )
                resources_resp.raise_for_status()
                resources = resources_resp.json()
                if not resources:
                    raise HTTPException(status_code=400, detail="No Jira Cloud resources accessible")
                cloud_id = resources[0]["id"]
        except httpx.HTTPStatusError as exc:
            print("OAuth callback error:", exc.response.text)
            raise HTTPException(status_code=500, detail="OAuth exchange failed") from exc

        # Calculate expiry time (1 hour from now)
        expiry_time = int(datetime.now().timestamp() + 3600) * 1000  # milliseconds for JS
        
        # Redirect to the same origin with auth data as URL parameters
        # The frontend will handle storing the credentials
        frontend_url = f"http://localhost:5000?access_token={access_token}&cloud_id={cloud_id}&expiry={expiry_time}"
        return RedirectResponse(frontend_url)

    # ---- Normal page load ----
    return FileResponse(index_file)


# ---------------------------------------------------------------------------
#  OAuth login / logout helpers
# ---------------------------------------------------------------------------

@app.get("/login", include_in_schema=False)
async def login():
    """Redirect the user to Atlassian OAuth consent screen."""
    state = "staticstate"  # In production generate and validate per-session
    authorize_url = (
        "https://auth.atlassian.com/authorize?"
        f"audience=api.atlassian.com&client_id={CLIENT_ID}"
        "&scope=read%3Ajira-work"
        f"&redirect_uri={REDIRECT_URI}"
        f"&state={state}&response_type=code&prompt=consent"
    )
    return RedirectResponse(authorize_url)


@app.get("/logout", include_in_schema=False)
async def logout():
    """Clear auth cookies and redirect to root."""
    resp = RedirectResponse("/", status_code=302)
    resp.delete_cookie("access_token")
    resp.delete_cookie("cloud_id")
    return resp


@app.post("/api/logout", include_in_schema=False)
async def api_logout():
    """API endpoint to logout - just return success, frontend handles localStorage cleanup."""
    return {"success": True, "message": "Logged out successfully"}


# ---------------------------------------------------------------------------
#  API endpoints for authenticated SPA (status, worklogs)
# ---------------------------------------------------------------------------

def _require_auth(request: Request) -> tuple[str, str]:
    # First try to get from Authorization header (for frontend API calls)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # Format: "Bearer access_token:cloud_id"
        try:
            token_and_cloud = auth_header[7:]  # Remove "Bearer "
            if ":" in token_and_cloud:
                token, cloud_id = token_and_cloud.split(":", 1)
                return token, cloud_id
        except:
            pass
    
    # Fallback to cookies (for direct backend access)
    token = request.cookies.get("access_token")
    cloud_id = request.cookies.get("cloud_id")
    if not token or not cloud_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return token, cloud_id


@app.get("/api/status")
async def api_status(request: Request):
    """Return auth status."""
    try:
        _require_auth(request)
        return {"authenticated": True}
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@app.get("/api/worklogs")
async def api_worklogs(request: Request, year: int, month: int):
    """Return all worklog entries for the specified month (1-12)."""
    try:
        access_token, cloud_id = _require_auth(request)
    except HTTPException:
        # Auth failed - return 401 to trigger frontend logout
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication expired")

    # Get ALL issues where current user has logged work, then filter by worklog date
    # This ensures we don't miss any issues where you logged work in this month
    # even if the issue itself wasn't updated recently
    jql = "worklogAuthor = currentUser()"
    
    search_url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/search"
    
    # Paginate through ALL issues to ensure we don't miss any worklogs
    all_issues = []
    start_at = 0
    max_results = 100
    
    try:
        async with httpx.AsyncClient() as client:
            while True:
                params = {
                    "jql": jql,
                    "startAt": start_at,
                    "maxResults": max_results,
                    "fields": "summary,worklog",
                }
                
                resp = await client.get(
                    search_url,
                    headers={"Authorization": f"Bearer {access_token}"},
                    params=params,
                    timeout=30,
                )
                resp.raise_for_status()
                
                data = resp.json()
                batch_issues = data.get("issues", [])
                all_issues.extend(batch_issues)
                
                # Check if we've got all issues
                total = data.get("total", 0)
                if start_at + max_results >= total:
                    break
                    
                start_at += max_results
                
    except httpx.HTTPStatusError as exc:
        print("Jira search error", exc.response.text)
        # If it's a 401, the token is expired - return 401 to trigger frontend logout
        if exc.response.status_code == 401:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Jira token expired")
        raise HTTPException(status_code=500, detail="Jira API error") from exc

    issues = all_issues
    logs_by_date: dict[str, list] = {}

    for issue in issues:
        key = issue["key"]
        summary = issue["fields"]["summary"]
        # Use search response for most issues, but get complete data for AT-198 since we know it's missing data
        if key == "AT-198":
            try:
                async with httpx.AsyncClient() as client:
                    full_worklog_resp = await client.get(
                        f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/issue/{key}/worklog",
                        headers={"Authorization": f"Bearer {access_token}"},
                        timeout=15,
                    )
                    if full_worklog_resp.status_code == 200:
                        all_worklogs = full_worklog_resp.json().get("worklogs", [])
                        # Filter to only worklogs by current user
                        user_worklogs = [wl for wl in all_worklogs if wl.get("author", {}).get("displayName") == "Manav Shah"]
                    else:
                        user_worklogs = issue["fields"]["worklog"]["worklogs"]
            except:
                user_worklogs = issue["fields"]["worklog"]["worklogs"]
        else:
            # Use the faster search response for all other issues
            user_worklogs = issue["fields"]["worklog"]["worklogs"]

        for wl in user_worklogs:
            started = wl["started"]
            
            try:
                d = datetime.fromisoformat(started.replace('Z', '+00:00'))
            except ValueError:
                # Handle timezone offsets without a colon, e.g. "+0530"
                d = datetime.strptime(started, "%Y-%m-%dT%H:%M:%S.%f%z")
                
            if d.year == year and d.month == month:
                date_key = d.strftime("%Y-%m-%d")
                logs_by_date.setdefault(date_key, []).append(
                    {
                        "issueKey": key,
                        "issueSummary": summary,
                        "timeSpent": wl.get("timeSpent"),
                        "comment": wl.get("comment"),
                        "author": wl.get("author", {}).get("displayName"),
                        "started": started,
                    }
                )

    return JSONResponse({"worklogData": logs_by_date})

# ---------------------------------------------------------------------------
#  Proxy: forward Jira REST calls from the SPA to Atlassian (avoids CORS)
#  (legacy path used only if needed)
# ---------------------------------------------------------------------------

@app.get("/jira-api/{jira_path:path}")
async def jira_api_proxy(
    jira_path: str,
    request: Request,
    auth: str = Query(..., description="Base64-encoded '<email>:<api_token>'"),
    jira_url: str | None = Query(None, description="Base Jira Cloud URL e.g. https://your-domain.atlassian.net"),
):
    """Lightweight pass-through that adds Basic-Auth and streams the response.

    The front-end calls paths like:
        /jira-api/rest/api/3/search?jql=...&fields=worklog&auth=<base64>

    We reconstruct the target URL using the provided *jira_url* or a default
    value, forward the request, and relay the response unchanged.  Only GET is
    supported because that’s all the SPA needs.
    """
    base_url = jira_url or DEFAULT_JIRA_URL
    target_url = f"{base_url}/{jira_path}"

    # Copy original query params except our control params
    params = dict(request.query_params)
    params.pop("auth", None)
    params.pop("jira_url", None)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                target_url,
                params=params,
                headers={
                    "Authorization": f"Basic {auth}",
                    "Accept": "application/json",
                },
                timeout=30,
            )
        # Return raw body so the front-end gets Atlassian’s JSON untouched
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=resp.headers.get("content-type", "application/json"),
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error connecting to Jira: {exc}",
        ) from exc


# ---------------------------------------------------------------------------
#  Catch-all route: serve React app for all other routes (React Router support)
# ---------------------------------------------------------------------------

@app.get("/{path:path}", include_in_schema=False)
async def serve_react_app(path: str):
    """Serve React app for all unmatched routes (SPA support)."""
    # Always serve the index.html for client-side routing
    return FileResponse(index_file)


# Server startup
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
