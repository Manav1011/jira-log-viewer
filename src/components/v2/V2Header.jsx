import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function V2Header() {
  const { logout } = useAuth()

  return (
    <header className="flex justify-between items-center py-3 px-6 border-b border-v2-surface-highest flex-shrink-0 bg-v2-surface z-50">
      <h1 className="text-xs font-bold text-v2-primary flex items-center tracking-[0.2em] label-caps">
        <i className="fas fa-terminal mr-3 text-sm opacity-80"></i>
        <span className="hidden sm:inline">JIRA_WORKLOG_SYSTEM // V2.0</span>
        <span className="sm:hidden">LOGS_V2</span>
      </h1>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-6 text-[9px] text-v2-on-surface-variant font-bold tracking-[0.15em] uppercase">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-v2-primary animate-pulse"></div>
            <span>NODE_STATUS: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500"></div>
            <span>LATENCY: 24MS</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="text-v2-on-surface hover:text-v2-primary border border-v2-on-surface-variant/20 hover:border-v2-primary/40 px-3 py-1.5 text-[9px] font-bold tracking-widest transition-all duration-300 label-caps bg-v2-surface-low"
        >
          <i className="fas fa-power-off mr-2 opacity-70"></i> 
          <span>SHUTDOWN</span>
        </button>
      </div>
    </header>
  )
}
