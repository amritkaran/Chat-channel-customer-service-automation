// Centralized AI event logging system for educational "Learning Mode"

class AIEventLogger {
  constructor() {
    this.events = []
    this.listeners = []
    this.maxEvents = 50 // Keep last 50 events
  }

  logEvent(event) {
    const timestamp = new Date().toISOString()
    const eventWithTimestamp = {
      ...event,
      timestamp,
      id: `${timestamp}-${Math.random()}`
    }

    this.events.unshift(eventWithTimestamp) // Add to beginning

    // Keep only maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(this.events))
  }

  subscribe(listener) {
    this.listeners.push(listener)
    // Immediately send current events to new subscriber
    listener(this.events)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  getEvents() {
    return this.events
  }

  clearEvents() {
    this.events = []
    this.listeners.forEach(listener => listener(this.events))
  }

  // Specific event logging methods
  logClosureDetection(data) {
    this.logEvent({
      type: 'closure_detection',
      icon: '🎯',
      title: 'Closure Detected',
      data
    })
  }

  logClassification(data) {
    this.logEvent({
      type: 'classification',
      icon: '🤖',
      title: 'LLM Classification',
      data
    })
  }

  logTimerChange(data) {
    this.logEvent({
      type: 'timer_change',
      icon: '⏱️',
      title: 'Timer State Change',
      data
    })
  }

  logCustomerMessage(data) {
    this.logEvent({
      type: 'customer_message',
      icon: '💬',
      title: 'Customer Message Generated',
      data
    })
  }

  logIdleDetection(data) {
    this.logEvent({
      type: 'idle_detection',
      icon: '⏰',
      title: 'Idle Detection Triggered',
      data
    })
  }
}

// Singleton instance
export const aiEventLogger = new AIEventLogger()
