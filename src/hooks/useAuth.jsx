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

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('jira_refresh_token')
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      localStorage.setItem('jira_access_token', data.access_token)
      localStorage.setItem('jira_token_expiry', data.expiry)
      if (data.refresh_token) {
        localStorage.setItem('jira_refresh_token', data.refresh_token)
      }

      return data.access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, logout the user
      logout()
      throw error
    }
  }

  const checkAuthStatus = async () => {
    try {
      // First, check if we have credentials in URL parameters (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('access_token')
      const cloudId = urlParams.get('cloud_id')
      const expiry = urlParams.get('expiry')
      const refreshTokenParam = urlParams.get('refresh_token')
      
      if (accessToken && cloudId && expiry) {
        // Store the credentials from OAuth callback
        localStorage.setItem('jira_access_token', accessToken)
        localStorage.setItem('jira_cloud_id', cloudId)
        localStorage.setItem('jira_token_expiry', expiry)
        if (refreshTokenParam) {
          localStorage.setItem('jira_refresh_token', refreshTokenParam)
        }
        
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
      
      if (token) {
        if (storedExpiry && new Date(parseInt(storedExpiry)) > new Date()) {
          setIsAuthenticated(true)
          setUser({ token })
        } else {
          // Token is expired, try to refresh
          try {
            const newToken = await refreshToken()
            setIsAuthenticated(true)
            setUser({ token: newToken })
          } catch (error) {
            // If refresh fails, it will automatically logout in refreshToken()
            console.error('Failed to refresh token:', error)
          }
        }
      } else {
        // No token available
        localStorage.removeItem('jira_access_token')
        localStorage.removeItem('jira_cloud_id')
        localStorage.removeItem('jira_token_expiry')
        localStorage.removeItem('jira_refresh_token')
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
    localStorage.removeItem('jira_refresh_token')
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