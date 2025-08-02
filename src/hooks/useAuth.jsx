import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // First, check if we have credentials in URL parameters (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('access_token')
      const cloudId = urlParams.get('cloud_id')
      const expiry = urlParams.get('expiry')
      
      if (accessToken && cloudId && expiry) {
        // Store the credentials from OAuth callback
        localStorage.setItem('jira_access_token', accessToken)
        localStorage.setItem('jira_cloud_id', cloudId)
        localStorage.setItem('jira_token_expiry', expiry)
        
        // Clean up URL by removing parameters
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        setIsAuthenticated(true)
        setUser({ token: accessToken })
        setIsLoading(false)
        return
      }
      
      // Check for stored tokens
      const token = localStorage.getItem('jira_access_token')
      const storedExpiry = localStorage.getItem('jira_token_expiry')
      
      if (token && storedExpiry && new Date(parseInt(storedExpiry)) > new Date()) {
        setIsAuthenticated(true)
        setUser({ token })
      } else {
        // Clear expired tokens
        localStorage.removeItem('jira_access_token')
        localStorage.removeItem('jira_cloud_id')
        localStorage.removeItem('jira_token_expiry')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = () => {
    window.location.href = '/login'
  }

  const logout = () => {
    localStorage.removeItem('jira_access_token')
    localStorage.removeItem('jira_cloud_id')
    localStorage.removeItem('jira_token_expiry')
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = '/logout'
  }

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}