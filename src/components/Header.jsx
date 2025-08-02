import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { logout } = useAuth()

  return (
    <header className="flex justify-between items-center py-3 px-4 border-b border-jira-border flex-shrink-0 bg-white z-50">
      <h1 className="text-lg font-medium text-jira-blue-dark flex items-center">
        <div className="bg-jira-blue text-white p-1.5 rounded mr-2 shadow-sm">
          <i className="fas fa-calendar-check text-sm"></i>
        </div> 
        <span className="hidden sm:inline">Jira Worklog Viewer</span>
        <span className="sm:hidden">Worklog</span>
      </h1>
      
      <button 
        onClick={logout}
        className="text-jira-blue border border-jira-blue px-3 py-1 text-xs rounded hover:bg-jira-blue hover:text-white transition-all duration-200"
      >
        <i className="fas fa-sign-out-alt mr-1"></i> 
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  )
}