from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
import uvicorn
from starlette.background import BackgroundTask
import asyncio
from contextlib import asynccontextmanager

MAX_CONCURRENT_REQUESTS = 20  # Tune as needed for your infra/Jira limits
semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.httpx_client = httpx.AsyncClient()
    try:
        yield
    finally:
        await app.state.httpx_client.aclose()

app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def fetch_all_worklogs_for_issue(issue_key, headers):
    """
    Fetch all worklogs for a given issue, handling pagination if needed.
    Uses shared client and concurrency control.
    """
    url = f"https://webelight.atlassian.net/rest/api/3/issue/{issue_key}/worklog"
    all_worklogs = []
    start_at = 0
    while True:
        params = {"startAt": start_at}
        async with semaphore:
            resp = await app.state.httpx_client.get(url, params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        worklogs = data.get("worklogs", [])
        all_worklogs.extend(worklogs)
        if len(all_worklogs) >= data.get("total", 0):
            break
        start_at += len(worklogs)
    return all_worklogs

# Proxy middleware for Jira API requests
@app.api_route("/jira-api/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_jira_api(request: Request, rest_of_path: str):
    # Get the auth token from query parameters
    auth = request.query_params.get("auth")
    if not auth:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    # Construct the target URL (note how we're handling the path)
    target_url = f"https://webelight.atlassian.net/{rest_of_path}"
    
    # Get query parameters (excluding auth)
    params = dict(request.query_params)
    params.pop("auth", None)
    
    # Create headers with the authorization
    headers = {
        "Authorization": f"Basic {auth}",
        "Accept": "application/json",
    }
    
    # Make the request to Jira
    method = request.method
    try:
        if method == "GET":
            # Special handling for /worklog endpoint to fetch all pages
            if rest_of_path.endswith("/worklog") or "/worklog?" in rest_of_path:
                # Fetch all worklogs with pagination
                all_worklogs = []
                start_at = 0
                total = None
                while True:
                    page_params = params.copy()
                    page_params["startAt"] = start_at
                    async with semaphore:
                        response = await app.state.httpx_client.get(target_url, params=page_params, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                    worklogs = data.get("worklogs", [])
                    all_worklogs.extend(worklogs)
                    if total is None:
                        total = data.get("total", 0)
                    if len(all_worklogs) >= total:
                        break
                    start_at += len(worklogs)
                # Return the combined worklogs in the same structure as Jira
                result = data.copy()
                result["worklogs"] = all_worklogs
                result["startAt"] = 0
                result["total"] = total
                return JSONResponse(
                    content=result,
                    status_code=200
                )
            elif rest_of_path.endswith("/search"):
                # Proxy the search, but fetch all worklogs for each issue like Jira-Logs-View
                async with semaphore:
                    response = await app.state.httpx_client.get(target_url, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()
                issues = data.get("issues", [])
                # For each issue, fetch all worklogs if needed, in parallel
                async def fetch_and_patch(issue):
                    issue_key = issue.get("key")
                    worklog_field = issue.get("fields", {}).get("worklog", {})
                    total = worklog_field.get("total", 0)
                    worklogs = worklog_field.get("worklogs", [])
                    if len(worklogs) < total:
                        all_worklogs = await fetch_all_worklogs_for_issue(issue_key, headers)
                        issue["fields"]["worklog"]["worklogs"] = all_worklogs
                await asyncio.gather(*(fetch_and_patch(issue) for issue in issues))
                return JSONResponse(
                    content=data,
                    status_code=response.status_code
                )
            else:
                async with semaphore:
                    response = await app.state.httpx_client.get(target_url, params=params, headers=headers)
        elif method == "POST":
            body = await request.json()
            async with semaphore:
                response = await app.state.httpx_client.post(target_url, params=params, headers=headers, json=body)
        elif method == "PUT":
            body = await request.json()
            async with semaphore:
                response = await app.state.httpx_client.put(target_url, params=params, headers=headers, json=body)
        elif method == "DELETE":
            async with semaphore:
                response = await app.state.httpx_client.delete(target_url, params=params, headers=headers)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
        # Return the response
        return JSONResponse(
            content=response.json() if response.text else {},
            status_code=response.status_code
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Jira: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Serve static files (must be after API routes)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("server_fastapi:app", host="0.0.0.0", port=3000, reload=True)
