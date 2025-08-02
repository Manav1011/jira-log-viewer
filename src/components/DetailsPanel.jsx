import React from 'react'
import { format } from 'date-fns'

function parseTimeSpent(timeStr) {
  if (!timeStr) return 0
  
  let totalMinutes = 0
  
  // Match all time units: days, hours, minutes
  const dayMatch = timeStr.match(/(\d+)d/)
  const hourMatch = timeStr.match(/(\d+)h/)
  const minuteMatch = timeStr.match(/(\d+)m/)
  
  if (dayMatch) {
    totalMinutes += parseInt(dayMatch[1]) * 8 * 60 // 8 hours per day
  }
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1])
  }
  
  return totalMinutes
}

function formatTime(minutes) {
  if (!minutes) return '0m'
  
  const days = Math.floor(minutes / (8 * 60)) // 8 hours per day
  const remainingMinutes = minutes % (8 * 60)
  const hours = Math.floor(remainingMinutes / 60)
  const mins = remainingMinutes % 60
  
  let result = ''
  if (days > 0) result += `${days}d `
  if (hours > 0) result += `${hours}h `
  if (mins > 0) result += `${mins}m`
  
  return result.trim() || '0m'
}

// Helper function to extract text from Jira comment object
function extractCommentText(comment) {
  if (!comment) return ''
  
  // If it's already a string, return it
  if (typeof comment === 'string') return comment
  
  // If it's an object with content (Atlassian Document Format)
  if (comment && typeof comment === 'object' && comment.content) {
    const extractTextFromContent = (content) => {
      if (Array.isArray(content)) {
        return content.map(item => extractTextFromContent(item)).join('')
      }
      
      if (content && typeof content === 'object') {
        if (content.type === 'text' && content.text) {
          return content.text
        }
        if (content.content) {
          return extractTextFromContent(content.content)
        }
      }
      
      return ''
    }
    
    return extractTextFromContent(comment.content)
  }
  
  // Fallback: try to stringify but safely
  try {
    return typeof comment === 'object' ? JSON.stringify(comment) : String(comment)
  } catch {
    return '[Complex comment]'
  }
}

export default function DetailsPanel({ selectedDate, onClose, className = '' }) {
  if (!selectedDate) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-jira-border flex flex-col min-h-0 ${className}`}>
        <div className="flex justify-between items-center bg-gray-50 py-3 px-4 border-b border-jira-border rounded-t-lg flex-shrink-0">
          <h2 className="text-sm font-medium text-gray-700">Select a day to view details</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center flex-1">
          <div className="text-3xl mb-2 text-gray-300">
            <i className="fas fa-calendar-day"></i>
          </div>
          <p className="text-sm">Click on a day in the calendar to view detailed logs</p>
        </div>
      </div>
    )
  }

  const { date, logs } = selectedDate
  const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy')
  const totalMinutes = logs.reduce((sum, log) => sum + parseTimeSpent(log.timeSpent), 0)

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-jira-border flex flex-col min-h-0 ${className}`}>
      <div className="flex justify-between items-center bg-gray-50 py-3 px-4 border-b border-jira-border rounded-t-lg flex-shrink-0">
        <h2 className="text-sm font-medium text-gray-700">{formattedDate}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-0">
        <div className="flex gap-3 mb-3 pb-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2">
            <div className="bg-blue-50 text-blue-600 p-1.5 rounded">
              <i className="fas fa-clock text-sm"></i>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide">Time</h3>
              <p className="text-sm font-semibold text-gray-900">{formatTime(totalMinutes)}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="bg-green-50 text-green-600 p-1.5 rounded">
              <i className="fas fa-tasks text-sm"></i>
            </div>
            <div>
              <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide">Issues</h3>
              <p className="text-sm font-semibold text-gray-900">{logs.length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-blue-600">{log.issueKey}</h4>
                <span className="text-sm text-gray-500">{log.timeSpent}</span>
              </div>
              {log.comment && (
                <p className="text-sm text-gray-600 line-clamp-2">{extractCommentText(log.comment)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}