import { useState, useEffect } from 'react'
import './MuteButton.css'
import { audioService } from '../utils/audioService'

function MuteButton() {
  const [isMuted, setIsMuted] = useState(false) // Default to unmuted

  // Initialize audio service with unmuted state
  useEffect(() => {
    audioService.setMuted(false)
  }, [])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)

    // Update audio service
    audioService.setMuted(newMutedState)

    // Save to localStorage
    localStorage.setItem('audioMuted', newMutedState.toString())

    console.log(`Audio ${newMutedState ? 'muted' : 'unmuted'}`)
  }

  return (
    <button
      className={`mute-button ${isMuted ? 'muted' : ''}`}
      onClick={toggleMute}
      title={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  )
}

export default MuteButton
