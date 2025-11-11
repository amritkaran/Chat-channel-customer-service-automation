import { useState, useEffect } from 'react'
import './SessionHeader.css'

function SessionHeader({ sessionManager }) {
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    if (!sessionManager) return

    // Update progress immediately
    const updateProgress = () => {
      setProgress(sessionManager.getProgress())
    }

    updateProgress()

    // Update every second
    const interval = setInterval(updateProgress, 1000)

    return () => clearInterval(interval)
  }, [sessionManager])

  if (!progress) {
    return null
  }

  const { current, total, percentage, phase, aiEnabled } = progress

  const phaseInfo = aiEnabled ? {
    label: 'AI Enabled',
    icon: '✨',
    description: 'AI Learning Phase (1-5)',
    color: 'ai'
  } : {
    label: 'Manual',
    icon: '👤',
    description: 'Manual Phase (6-10)',
    color: 'manual'
  }

  return (
    <div className="session-header">
      <div className="session-info">
        <div className="contact-counter">
          <span className="counter-text">Contact {current}/{total}</span>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="percentage-text">{Math.round(percentage)}%</span>
        </div>

        <div className={`phase-indicator ${phaseInfo.color}`}>
          <span className="phase-icon">{phaseInfo.icon}</span>
          <div className="phase-text">
            <span className="phase-label">{phaseInfo.label}</span>
            <span className="phase-description">{phaseInfo.description}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionHeader
