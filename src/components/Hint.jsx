import { useState, useEffect } from 'react'
import './Hint.css'

function Hint({
  message,
  position = 'bottom',
  storageKey,
  showDelay = 500,
  autoHide = false,
  autoHideDelay = 8000
}) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if hint was already dismissed
    if (storageKey) {
      const wasDismissed = localStorage.getItem(`hint_dismissed_${storageKey}`)
      if (wasDismissed) {
        setDismissed(true)
        return
      }
    }

    // Show hint after delay
    const showTimer = setTimeout(() => {
      setVisible(true)
    }, showDelay)

    // Auto-hide if enabled
    let hideTimer
    if (autoHide) {
      hideTimer = setTimeout(() => {
        handleDismiss()
      }, showDelay + autoHideDelay)
    }

    return () => {
      clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [storageKey, showDelay, autoHide, autoHideDelay])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    if (storageKey) {
      localStorage.setItem(`hint_dismissed_${storageKey}`, 'true')
    }
  }

  if (dismissed || !visible) return null

  return (
    <div className={`hint hint-${position}`}>
      <div className="hint-content">
        <span className="hint-icon">💡</span>
        <span className="hint-message">{message}</span>
        <button className="hint-close" onClick={handleDismiss}>
          ✕
        </button>
      </div>
      <div className="hint-arrow"></div>
    </div>
  )
}

export default Hint
