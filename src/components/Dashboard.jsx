import React, { useState, useEffect } from 'react'
import Calendar from './Calendar'
import DetailsPanel from './DetailsPanel'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard({ onError }) {
  const { logout } = useAuth()
  const [worklogData, setWorklogData] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [isLoading, setIsLoading] = useState(false)

  // Function to parse time spent string into minutes
  const parseTimeSpent = (timeStr) => {
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

  // Calculate total hours for the month
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
      
      if (!token || !cloudId) {
        throw new Error('No authentication credentials found')
      }
      
      const response = await fetch(`/api/worklogs?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}:${cloudId}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        // If unauthorized, logout the user and redirect to login
        if (response.status === 401) {
          console.log('Token expired, logging out user')
          logout()
          return
        }
        throw new Error(`Failed to fetch worklog data: ${response.status}`)
      }
      const data = await response.json()
      setWorklogData(data.worklogData || {})
    } catch (error) {
      console.error('Error fetching worklog data:', error)
      // Check if it's an auth error
      if (error.message && error.message.includes('401')) {
        logout()
        return
      }
      onError('Failed to load worklog data. Please try again.')
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
    setSelectedDate(null) // Clear selection when changing months
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 pb-4 p-4">
      <Calendar
        year={currentYear}
        month={currentMonth}
        worklogData={worklogData}
        totalHours={calculateTotalHours()}
        onDateSelect={handleDateSelect}
        onMonthChange={handleMonthChange}
        className="lg:col-span-3"
      />
      
      <DetailsPanel
        selectedDate={selectedDate}
        onClose={() => setSelectedDate(null)}
        className="lg:col-span-1"
      />
    </div>
  )
}