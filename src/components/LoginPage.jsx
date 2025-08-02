import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 animate-fade-in">
      <div className="max-w-md w-full">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-jira-blue to-jira-blue-dark text-white p-4 rounded-2xl shadow-lg inline-block mb-4">
            <i className="fas fa-calendar-check text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Jira Worklog Viewer</h1>
          <p className="text-gray-600">Track and visualize your team's time investments</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
            <div className="bg-white p-3 rounded-full shadow-md inline-block mb-4">
              <i className="fab fa-atlassian text-2xl text-blue-600"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Connect your Atlassian account to get started</p>
          </div>
          
          <div className="p-8">
            <button 
              onClick={login}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-base group"
            >
              <i className="fab fa-atlassian text-lg group-hover:scale-110 transition-transform"></i> 
              <span>Sign in with Atlassian</span>
              <i className="fas fa-arrow-right text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Secure OAuth authentication • No passwords stored
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-green-600 mb-2">
              <i className="fas fa-shield-alt text-lg"></i>
            </div>
            <p className="text-xs text-gray-600 font-medium">Secure</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-blue-600 mb-2">
              <i className="fas fa-chart-line text-lg"></i>
            </div>
            <p className="text-xs text-gray-600 font-medium">Analytics</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-purple-600 mb-2">
              <i className="fas fa-clock text-lg"></i>
            </div>
            <p className="text-xs text-gray-600 font-medium">Real-time</p>
          </div>
        </div>
      </div>
    </div>
  )
}