#!/bin/bash

# Setup script for Jira Worklog Viewer

echo "🚀 Setting up Jira Worklog Viewer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and npm"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Install Node.js dependencies  
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "   1. Terminal 1: npm run serve    (Backend on port 5000)"
echo "   2. Terminal 2: npm run dev      (Frontend on port 3000)"
echo "   3. Open browser: http://localhost:3000"