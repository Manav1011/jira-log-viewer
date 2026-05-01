import React from 'react'
import { format } from 'date-fns'

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

function formatTime(minutes) {
  if (!minutes) return '0M'
  const days = Math.floor(minutes / (8 * 60))
  const remainingMinutes = minutes % (8 * 60)
  const hours = Math.floor(remainingMinutes / 60)
  const mins = remainingMinutes % 60
  let result = ''
  if (days > 0) result += `${days}D `
  if (hours > 0) result += `${hours}H `
  if (mins > 0) result += `${mins}M`
  return result.trim() || '0M'
}

function extractCommentText(comment) {
  if (!comment) return ''
  if (typeof comment === 'string') return comment
  if (comment && typeof comment === 'object' && comment.content) {
    const extractTextFromContent = (content) => {
      if (Array.isArray(content)) return content.map(item => extractTextFromContent(item)).join('')
      if (content && typeof content === 'object') {
        if (content.type === 'text' && content.text) return content.text
        if (content.content) return extractTextFromContent(content.content)
      }
      return ''
    }
    return extractTextFromContent(comment.content)
  }
  return ''
}

export default function V2DetailsPanel({ selectedDate, onClose, className = '' }) {
  if (!selectedDate) {
    return (
      <div className={`bg-v2-surface flex flex-col min-h-0 border border-v2-surface-highest ${className}`}>
        <div className="flex justify-between items-center bg-v2-surface-low py-3 px-4 border-b border-v2-surface-highest flex-shrink-0">
          <h2 className="text-[10px] font-bold text-v2-on-surface-variant tracking-widest label-caps">SYSTEM_READY</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
          <div className="text-4xl mb-4 text-v2-surface-highest">
            <i className="fas fa-microchip"></i>
          </div>
          <p className="text-[10px] text-v2-on-surface-variant font-mono uppercase tracking-widest leading-relaxed">
            Awaiting input...<br/>Select entry from grid to decrypt logs.
          </p>
        </div>
      </div>
    )
  }

  const { date, logs } = selectedDate
  const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy').toUpperCase()
  const totalMinutes = logs.reduce((sum, log) => sum + parseTimeSpent(log.timeSpent), 0)

  return (
    <div className={`bg-v2-surface flex flex-col min-h-0 border border-v2-surface-highest ${className}`}>
      <div className="flex justify-between items-center bg-v2-surface-low py-3 px-4 border-b border-v2-surface-highest flex-shrink-0">
        <h2 className="text-[10px] font-bold text-v2-primary tracking-widest label-caps">{formattedDate}</h2>
        <button
          onClick={onClose}
          className="text-v2-on-surface-variant hover:text-v2-primary transition-colors"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-v2-surface-low border border-v2-surface-highest p-4">
            <h3 className="text-[9px] text-v2-on-surface-variant font-bold label-caps mb-2 opacity-60">AGGREGATE_TIME</h3>
            <p className={`text-xl font-bold font-mono tracking-tighter ${totalMinutes >= 480 ? 'text-v2-success' : 'text-v2-error'}`}>
              {formatTime(totalMinutes)}
            </p>
          </div>
          <div className="bg-v2-surface-low border border-v2-surface-highest p-4">
            <h3 className="text-[9px] text-v2-on-surface-variant font-bold label-caps mb-2 opacity-60">ENTRY_COUNT</h3>
            <p className="text-xl font-bold text-v2-on-surface font-mono tracking-tighter">{logs.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={index} className="border-l-2 border-v2-surface-highest bg-v2-surface-low/50 p-4 hover:border-v2-primary transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-v2-primary font-mono tracking-tight">{log.issueKey}</h4>
                  {log.issueSummary && (
                    <p className="text-xs text-v2-on-surface-variant mt-1.5 font-medium leading-relaxed">{log.issueSummary.toUpperCase()}</p>
                  )}
                </div>
                <div className="text-xs text-v2-on-surface font-mono bg-v2-surface-highest px-2 py-1 ml-3">
                  {log.timeSpent.toUpperCase()}
                </div>
              </div>
              {log.comment && (
                <div className="mt-3 pt-3 border-t border-v2-surface-highest/50">
                  <p className="text-xs text-v2-on-surface/80 leading-relaxed font-light italic">
                    {extractCommentText(log.comment)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
