import { useState } from 'react'
import './LogoutButton.css'

function LogoutButton({ onLogout, hasActiveContacts }) {
  const [showError, setShowError] = useState(false)

  const handleClick = () => {
    if (hasActiveContacts) {
      setShowError(true)
      setTimeout(() => {
        setShowError(false)
      }, 3000) // Hide error after 3 seconds
    } else {
      onLogout()
    }
  }

  return (
    <div className="logout-container">
      <button
        className={`logout-button ${hasActiveContacts ? 'disabled' : ''}`}
        onClick={handleClick}
        title={hasActiveContacts ? "Close all contacts before logging out" : "Logout"}
      >
        🚪 Logout
      </button>
      {showError && (
        <div className="logout-error">
          Please close all active contacts before logging out
        </div>
      )}
    </div>
  )
}

export default LogoutButton
