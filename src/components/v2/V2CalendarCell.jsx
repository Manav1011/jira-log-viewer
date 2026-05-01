import React from 'react'

function parseTimeSpent(timeStr) {
  if (!timeStr) return 0
  let totalMinutes = 0
  const dayMatch = timeStr.match(/(\d+)d/)
  const hourMatch = timeStr.match(/(\d+)h/)
  const minuteMatch = timeStr.match(/(\d+)m/)
  if (dayMatch) totalMinutes += parseInt(dayMatch[1]) * 8 * 60
  if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60
  if (minuteMatch) totalMinutes += parseInt(minuteMatch[1])
  return totalMinutes
}

export default function V2CalendarCell({ day, logs, isWeekend, onClick }) {
  const hasLogs = logs.length > 0
  const totalMinutes = logs.reduce((sum, log) => sum + parseTimeSpent(log.timeSpent), 0)
  const totalHours = totalMinutes / 60
  
  // Segmented bar calculation (up to 8 segments)
  const segments = Math.min(8, Math.ceil(totalHours))
  const isTargetReached = totalHours >= 8

  return (
    <div 
      className={`calendar-cell ${isWeekend ? 'weekend' : ''} ${hasLogs ? 'has-logs' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="day-number label-caps">{day}</span>
        {hasLogs && (
          <span className={`text-[10px] font-bold ${isTargetReached ? 'text-v2-success' : 'text-v2-error'}`}>
            {totalHours.toFixed(1)}H
            {isTargetReached && <i className="fas fa-check-circle ml-1 text-[8px]"></i>}
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1.5">
        {hasLogs && (
          <>
            <div className="flex gap-0.5">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 flex-1 ${
                    i < segments 
                      ? (isTargetReached 
                          ? 'bg-v2-success shadow-[0_0_8px_rgba(5,150,105,0.6)]' 
                          : 'bg-v2-error shadow-[0_0_8px_rgba(239,68,68,0.5)]') 
                      : 'bg-v2-surface-highest'
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {logs.slice(0, 2).map((log, i) => (
                <div key={i} className="text-[11px] text-v2-on-surface truncate font-mono uppercase tracking-tighter bg-v2-surface-low px-1.5 py-1 leading-none border-l border-v2-primary/30">
                  {log.issueKey}
                </div>
              ))}
              {logs.length > 2 && (
                <div className="text-[9px] text-v2-on-surface-variant font-bold pl-1">
                  + {logs.length - 2} ENTRIES
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
