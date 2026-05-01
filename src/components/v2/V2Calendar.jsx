import React from 'react'
import V2CalendarCell from './V2CalendarCell'

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
]

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export default function V2Calendar({ 
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell" />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const logs = worklogData[dateStr] || []
      const dayOfWeek = new Date(year, month - 1, day).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      days.push(
        <V2CalendarCell
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
    <div className={`bg-v2-surface flex flex-col min-h-0 border border-v2-surface-highest ${className}`}>
      {/* Header */}
      <div className="bg-v2-surface-low border-b border-v2-surface-highest py-4 px-6 flex justify-between items-center flex-shrink-0">
        <button
          onClick={() => onMonthChange('prev')}
          className="text-v2-on-surface-variant hover:text-v2-primary hover:border-v2-primary/40 transition-all p-2 w-10 h-8 flex items-center justify-center border border-v2-surface-highest bg-v2-surface"
        >
          <i className="fas fa-chevron-left text-[10px]"></i>
        </button>
        <div className="text-center">
          <div className="text-[11px] font-bold tracking-[0.3em] label-caps text-v2-primary">
            {MONTH_NAMES[month - 1]} // {year}
          </div>
          <div className="text-[9px] text-v2-on-surface-variant mt-1.5 font-mono opacity-60 tracking-widest">
            SESSION_AGGREGATE: {totalHours.toFixed(1)} HRS
          </div>
        </div>
        <button
          onClick={() => onMonthChange('next')}
          className="text-v2-on-surface-variant hover:text-v2-primary hover:border-v2-primary/40 transition-all p-2 w-10 h-8 flex items-center justify-center border border-v2-surface-highest bg-v2-surface"
        >
          <i className="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-v2-surface-highest bg-v2-surface-dim flex-shrink-0">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-2 text-center font-bold text-[10px] text-v2-on-surface-variant border-r border-v2-surface-highest last:border-r-0 label-caps">
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
