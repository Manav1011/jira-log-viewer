import React from 'react'

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

export default function CalendarCell({ day, logs, isWeekend, onClick }) {
  const hasLogs = logs.length > 0
  const totalMinutes = logs.reduce((sum, log) => sum + parseTimeSpent(log.timeSpent), 0)
  const totalHours = totalMinutes / 60

  const getCellClasses = () => {
    let classes = 'calendar-cell'
    if (isWeekend) classes += ' weekend'
    if (hasLogs) classes += ' has-logs'
    return classes
  }

  const getBadgeColor = () => {
    if (totalHours >= 8) return 'bg-jira-green'
    if (totalHours >= 6) return 'bg-jira-yellow'
    return 'bg-jira-red'
  }

  return (
    <div className={getCellClasses()} onClick={onClick}>
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-medium text-gray-700 day-number">{day}</div>
        {hasLogs && (
          <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${getBadgeColor()}`}>
            {totalHours.toFixed(1)}h
          </span>
        )}
      </div>
      
      {hasLogs && (
        <div className="flex flex-col gap-1 worklog-preview overflow-hidden">
          {logs.slice(0, 1).map((log, index) => (
            <div
              key={index}
              className="text-xs p-1.5 rounded bg-white/90 border border-gray-200 flex justify-between items-center"
            >
              <span className="font-medium text-blue-600 truncate">{log.issueKey}</span>
              <span className="text-gray-500 text-xs flex-shrink-0">{log.timeSpent}</span>
            </div>
          ))}
          {logs.length > 1 && (
            <div className="text-xs text-gray-500 text-center bg-gray-100 rounded py-0.5">
              +{logs.length - 1}
            </div>
          )}
        </div>
      )}
    </div>
  )
}