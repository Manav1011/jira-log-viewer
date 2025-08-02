import React from 'react'

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null

  return (
    <div className="bg-jira-red/10 border border-jira-red/20 text-jira-red p-2 mx-4 mt-2 rounded flex items-center text-sm">
      <i className="fas fa-exclamation-circle mr-2"></i>
      <span className="flex-1">{message}</span>
      <button 
        onClick={onClose}
        className="text-jira-red/70 hover:text-jira-red ml-2"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}