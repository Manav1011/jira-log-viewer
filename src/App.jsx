import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import ErrorBanner from './components/ErrorBanner'
import { AuthProvider, useAuth } from './hooks/useAuth'
import V2Layout from './components/v2/V2Layout'
import V2Dashboard from './components/v2/V2Dashboard'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState(null)

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-jira-border border-t-jira-blue"></div>
          <p className="mt-4 text-jira-text">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden font-sans">
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-scroll" style={{ scrollbarWidth: 'none' }}>
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? (
                <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100">
                  <LoginPage />
                </div>
              ) : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  <V2Layout>
                    <V2Dashboard onError={setError} />
                  </V2Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/old" 
              element={
                isAuthenticated ? (
                  <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 text-jira-text">
                    <Header />
                    <Dashboard onError={setError} />
                  </div>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App