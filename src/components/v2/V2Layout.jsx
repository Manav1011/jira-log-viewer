import React from 'react'
import V2Header from './V2Header'
import { useAuth } from '../../hooks/useAuth'

export default function V2Layout({ children }) {
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="v2-theme h-screen flex flex-col overflow-hidden selection:bg-v2-primary selection:text-v2-on-primary">
      {isAuthenticated && <V2Header />}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  )
}
