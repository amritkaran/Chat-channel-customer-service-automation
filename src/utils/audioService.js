// Audio notification service using Web Audio API

class AudioService {
  constructor() {
    this.audioContext = null
    this.initialized = false
    this.isMuted = false
    this.ringerIntervalId = null
  }

  // Initialize AudioContext (must be called after user interaction)
  init() {
    if (!this.initialized) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
    }
  }

  // Set mute state
  setMuted(muted) {
    this.isMuted = muted
    if (muted) {
      this.stopContinuousRinger()
    }
  }

  // Get mute state
  getMuted() {
    return this.isMuted
  }

  // Play incoming call ringer (low volume, gentle tone)
  playIncomingRinger() {
    if (this.isMuted) return

    this.init()

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Low volume
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime)

    // Gentle phone ring tone (two tones)
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1)

    oscillator.type = 'sine'

    // Play for 0.4 seconds
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.4)

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4)
  }

  // Start continuous ringing (for incoming contacts)
  startContinuousRinger() {
    if (this.isMuted) return

    // Stop any existing ringer
    this.stopContinuousRinger()

    // Play immediately
    this.playIncomingRinger()

    // Then repeat every 3 seconds
    this.ringerIntervalId = setInterval(() => {
      if (!this.isMuted) {
        this.playIncomingRinger()
      }
    }, 3000)
  }

  // Stop continuous ringing
  stopContinuousRinger() {
    if (this.ringerIntervalId) {
      clearInterval(this.ringerIntervalId)
      this.ringerIntervalId = null
    }
  }

  // Play unread message notification (very gentle, subtle)
  playMessageNotification() {
    if (this.isMuted) return

    this.init()

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Very low volume for subtlety
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)

    // Gentle notification tone
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.type = 'sine'

    // Short, gentle beep
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.15)

    // Quick fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15)
  }
}

export const audioService = new AudioService()
