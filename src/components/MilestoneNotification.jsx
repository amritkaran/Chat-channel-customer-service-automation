import { useEffect, useState } from 'react'
import './MilestoneNotification.css'

function MilestoneNotification({ milestone, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 500) // Wait for exit animation
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const milestoneConfig = {
    phase_transition: {
      title: '🎉 Halfway There!',
      message: 'AI Phase Complete',
      detail: 'Switching to Manual mode for next 5 contacts',
      color: 'transition'
    },
    session_complete: {
      title: '🏆 Session Complete!',
      message: 'All 10 Contacts Handled',
      detail: 'View your performance summary',
      color: 'complete'
    }
  }

  const config = milestoneConfig[milestone] || {}

  return (
    <div className={`milestone-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`milestone-card ${config.color}`}>
        <div className="milestone-confetti">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>

        <div className="milestone-content">
          <h2 className="milestone-title">{config.title}</h2>
          <p className="milestone-message">{config.message}</p>
          <p className="milestone-detail">{config.detail}</p>
        </div>

        <button className="milestone-close-btn" onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 500)
        }}>
          Continue →
        </button>
      </div>
    </div>
  )
}

export default MilestoneNotification
