import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[100vh] bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Main loading animation */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="inline-block w-20 h-20 rounded-full border-4 border-gray-200 border-t-jira-blue animate-spin"></div>
          
          {/* Inner pulsing circle with ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-10 h-10 bg-jira-blue rounded-full animate-pulse loading-ripple">
              {/* Calendar icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-calendar-alt text-white text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-700 animate-fade-in">Loading worklog data</h3>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-jira-blue rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-jira-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-jira-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-500 animate-fade-in">Fetching your time tracking data from Jira...</p>
        </div>

        {/* Progress bar animation */}
        <div className="mt-8 w-80 bg-gray-200 rounded-full h-3 mx-auto overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-jira-blue via-blue-400 to-jira-blue rounded-full loading-progress-bar shadow-sm"></div>
        </div>

        {/* Additional loading indicators */}
        <div className="mt-6 flex justify-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <i className="fas fa-search text-sm"></i>
            <span className="text-xs">Searching issues</span>
          </div>
          <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '1s' }}>
            <i className="fas fa-clock text-sm"></i>
            <span className="text-xs">Processing worklogs</span>
          </div>
          <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <i className="fas fa-chart-bar text-sm"></i>
            <span className="text-xs">Organizing data</span>
          </div>
        </div>
      </div>
    </div>
  )
}