# Jira Worklog Viewer

A modern, beautiful React application for visualizing Jira worklog data with calendar views and analytics.

## Features

- 🎨 **Beautiful UI** - Modern, clean design with Tailwind CSS
- 📅 **Calendar View** - Monthly calendar showing worklog data
- 🔐 **Secure OAuth** - Atlassian OAuth integration
- 📊 **Analytics** - Time tracking and productivity insights
- 📱 **Responsive** - Works great on all devices
- ⚡ **Fast** - Built with React and Vite

## Quick Start

### For Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Python backend:**
   ```bash
   npm run serve
   ```
   This will start the FastAPI backend on `http://localhost:5000`

3. **Start the React development server (in a new terminal):**
   ```bash
   npm run dev
   ```
   This will start the React app on `http://localhost:3000`

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### For Production

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Architecture

### Frontend (React)
- **React 18** with hooks and modern patterns
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Vite** for fast development and building

### Backend (Python)
- **Flask** web server
- **Jira REST API** integration
- **OAuth 2.0** authentication

## Project Structure

```
logViewer/
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── main.py               # Python Flask server
├── package.json          # Node.js dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Start Python backend

## Environment Setup

Make sure you have:
- Node.js 16+ installed
- Python 3.8+ installed
- Jira API credentials configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.