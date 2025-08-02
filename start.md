# Quick Start Guide

## Port Configuration
- **React App (Frontend)**: http://localhost:3000
- **Python Backend (FastAPI)**: http://localhost:5000

## Starting the Application

### Terminal 1 - Backend Server
```bash
cd /home/manav1011/Documents/logViewer/logViewer

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start the backend server
npm run serve
# OR alternatively:
# uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Terminal 2 - Frontend Server
```bash
cd /home/manav1011/Documents/logViewer/logViewer

# Install Node dependencies (first time only)
npm install

# Start the React development server
npm run dev
```

### Access the Application
Open your browser and navigate to: **http://localhost:3000**

The React app will automatically proxy API requests to the Python backend running on port 5000.

## Troubleshooting

If you see port conflicts:
- Make sure no other applications are using ports 3000 or 5000
- You can change the frontend port in `vite.config.js`
- You can change the backend port in `main.py` and `vite.config.js` proxy settings