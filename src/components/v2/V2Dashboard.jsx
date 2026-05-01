import React, { useState, useEffect } from 'react'
import V2Calendar from './V2Calendar'
import V2DetailsPanel from './V2DetailsPanel'
import LoadingSpinner from '../LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'

export default function V2Dashboard({ onError }) {
  const { logout } = useAuth()
  const [worklogData, setWorklogData] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [isLoading, setIsLoading] = useState(false)

  const parseTimeSpent = (timeStr) => {
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

  const calculateTotalHours = () => {
    let totalMinutes = 0
    Object.values(worklogData).forEach(dayLogs => {
      dayLogs.forEach(log => {
        totalMinutes += parseTimeSpent(log.timeSpent)
      })
    })
    return totalMinutes / 60
  }

  useEffect(() => {
    fetchWorklogData(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const fetchWorklogData = async (year, month) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('jira_access_token')
      const cloudId = localStorage.getItem('jira_cloud_id')
      const refreshToken = localStorage.getItem('jira_refresh_token')
      
      if (!token || !cloudId) {
        throw new Error('No authentication credentials found')
      }
      
      const response = await fetch(`/api/worklogs?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}:${cloudId}`,
          'X-Refresh-Token': refreshToken || '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch worklog data: ${response.status}`)
      }
      const data = await response.json()
      setWorklogData(data.worklogData || {})
    } catch (error) {
      console.error('Error fetching worklog data:', error)
      onError('Failed to load worklog data.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (dateStr, logs) => {
    setSelectedDate({ date: dateStr, logs })
  }

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentYear(currentYear - 1)
        setCurrentMonth(12)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 12) {
        setCurrentYear(currentYear + 1)
        setCurrentMonth(1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
    setSelectedDate(null)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-v2-surface">
        <div className="text-center font-mono text-[10px] text-v2-primary tracking-[0.3em]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-v2-surface-highest border-t-v2-primary mb-4"></div>
          <div>LOADING_DATA...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-px bg-v2-surface-highest min-h-0 overflow-hidden">
      <V2Calendar
        year={currentYear}
        month={currentMonth}
        worklogData={worklogData}
        totalHours={calculateTotalHours()}
        onDateSelect={handleDateSelect}
        onMonthChange={handleMonthChange}
        className="lg:col-span-3"
      />
      
      <V2DetailsPanel
        selectedDate={selectedDate}
        onClose={() => setSelectedDate(null)}
        className="lg:col-span-1"
      />
    </div>
  )
}
