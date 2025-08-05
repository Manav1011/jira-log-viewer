import React from 'react'
import CalendarCell from './CalendarCell'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar({ 
  year, 
  month, 
  worklogData, 
  totalHours = 0,
  onDateSelect, 
  onMonthChange, 
  className = '' 
}) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const generateCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell" />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const logs = worklogData[dateStr] || []
      const dayOfWeek = new Date(year, month - 1, day).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      days.push(
        <CalendarCell
          key={dateStr}
          day={day}
          logs={logs}
          isWeekend={isWeekend}
          onClick={() => onDateSelect(dateStr, logs)}
        />
      )
    }
    
    return days
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-jira-border flex flex-col min-h-0 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-jira-blue to-jira-blue-dark text-white py-3 px-4 flex justify-between items-center flex-shrink-0 rounded-t-lg">
        <button
          onClick={() => onMonthChange('prev')}
          className="bg-white/10 hover:bg-white/20 transition-all p-2 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <div className="text-center">
          <div className="text-lg font-medium">
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <div className="text-sm opacity-90 mt-1">
            Total: {totalHours.toFixed(1)} hours
          </div>
        </div>
        <button
          onClick={() => onMonthChange('next')}
          className="bg-white/10 hover:bg-white/20 transition-all p-2 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <i className="fas fa-chevron-right text-sm"></i>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-jira-border bg-gray-50 flex-shrink-0">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-2 text-center font-medium text-sm text-jira-text-secondary border-r border-jira-border last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 calendar-grid min-h-0">
        {generateCalendarDays()}
      </div>
    </div>
  )
}