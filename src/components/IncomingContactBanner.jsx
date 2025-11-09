import { useEffect } from 'react'
import './IncomingContactBanner.css'
import { audioService } from '../utils/audioService'
import Hint from './Hint'

function IncomingContactBanner({ contact, onAccept, onDecline }) {
  // Start continuous ringing when banner appears
  useEffect(() => {
    audioService.startContinuousRinger()

    // Stop ringing when component unmounts (accept/decline/auto-decline)
    return () => {
      audioService.stopContinuousRinger()
    }
  }, [])

  const handleAccept = () => {
    audioService.stopContinuousRinger()
    onAccept()
  }

  const handleDecline = () => {
    audioService.stopContinuousRinger()
    onDecline()
  }

  return (
    <div className="incoming-contact-banner" style={{ position: 'relative' }}>
      <div className="banner-content">
        <div className="banner-icon">📞</div>
        <div className="banner-text">
          <strong>Incoming Contact</strong>
          <span className="banner-customer">{contact.customerName}</span>
        </div>
        <div className="banner-actions">
          <button className="accept-btn" onClick={handleAccept}>
            ✓ Accept
          </button>
          <button className="decline-btn" onClick={handleDecline}>
            ✕ Decline
          </button>
        </div>
      </div>
      <Hint
        message="Accept this contact to start chatting! You can handle up to 3 parallel conversations."
        position="bottom"
        storageKey="first_incoming_contact"
        showDelay={800}
        autoHide={true}
        autoHideDelay={6000}
      />
    </div>
  )
}

export default IncomingContactBanner
