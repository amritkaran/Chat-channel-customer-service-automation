/**
 * Metrics Service
 * Handles tracking contact sessions and AI events to Vercel Postgres
 */

const isDevelopment = !import.meta.env.PROD
const API_BASE = isDevelopment ? 'http://localhost:5174' : ''

// Generate a unique session ID for this browser session
let userSessionId = null
function getUserSessionId() {
  if (userSessionId) return userSessionId

  // Check if we have a session ID in sessionStorage
  userSessionId = sessionStorage.getItem('user_session_id')

  if (!userSessionId) {
    // Generate new session ID
    userSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('user_session_id', userSessionId)
  }

  return userSessionId
}

/**
 * Track contact session
 * @param {string} action - 'start', 'update', or 'end'
 * @param {object} data - Contact session data
 */
export async function trackContact(action, data) {
  try {
    const payload = {
      action,
      userSessionId: getUserSessionId(),
      ...data
    }

    const response = await fetch(`${API_BASE}/api/metrics/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to track contact:', error)
      return null
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error tracking contact:', error)
    return null
  }
}

/**
 * Track AI event
 * @param {string} sessionId - Contact session ID
 * @param {string} eventType - Type of event ('closure_detection', 'classification', etc.)
 * @param {object} data - Event data
 */
export async function trackAIEvent(sessionId, eventType, data) {
  try {
    const payload = {
      sessionId,
      eventType,
      ...data
    }

    const response = await fetch(`${API_BASE}/api/metrics/ai-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to track AI event:', error)
      return null
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error tracking AI event:', error)
    return null
  }
}

/**
 * Fetch dashboard metrics
 */
export async function fetchDashboardMetrics() {
  try {
    const response = await fetch(`${API_BASE}/api/metrics/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to fetch dashboard metrics:', error)
      return null
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return null
  }
}

/**
 * Contact Session Tracker Class
 * Simplifies tracking a single contact session lifecycle
 */
export class ContactSessionTracker {
  constructor(sessionId, customerName) {
    this.sessionId = sessionId
    this.customerName = customerName
    this.messageCount = 0
    this.agentMessageCount = 0
    this.customerMessageCount = 0
    this.startedAt = new Date()
    this.lastMessageAt = null
    this.closureDetected = false
    this.closureDetectedAt = null
  }

  /**
   * Start tracking this contact session
   */
  async start() {
    await trackContact('start', {
      sessionId: this.sessionId,
      customerName: this.customerName
    })
  }

  /**
   * Track a new message
   */
  incrementMessage(isAgent = true) {
    this.messageCount++
    this.lastMessageAt = new Date()
    if (isAgent) {
      this.agentMessageCount++
    } else {
      this.customerMessageCount++
    }
  }

  /**
   * Mark closure as detected
   */
  markClosureDetected() {
    this.closureDetected = true
    this.closureDetectedAt = new Date()
  }

  /**
   * Calculate time to closure in seconds
   */
  getTimeToClosureSeconds() {
    if (!this.closureDetectedAt) return null
    return Math.floor((this.closureDetectedAt - this.startedAt) / 1000)
  }

  /**
   * Update the contact session in database
   */
  async update() {
    await trackContact('update', {
      sessionId: this.sessionId,
      messageCount: this.messageCount,
      agentMessageCount: this.agentMessageCount,
      customerMessageCount: this.customerMessageCount,
      lastMessageAt: this.lastMessageAt?.toISOString(),
      closureDetected: this.closureDetected,
      closureDetectedAt: this.closureDetectedAt?.toISOString()
    })
  }

  /**
   * End the contact session
   * Note: timeToClosureSeconds is calculated in the API from lastMessageAt to endedAt
   */
  async end(wasAutoClosed, autoCloseTrigger, closureFeedback = null) {
    await trackContact('end', {
      sessionId: this.sessionId,
      messageCount: this.messageCount,
      agentMessageCount: this.agentMessageCount,
      customerMessageCount: this.customerMessageCount,
      lastMessageAt: this.lastMessageAt?.toISOString(),
      closureDetected: this.closureDetected,
      closureDetectedAt: this.closureDetectedAt?.toISOString(),
      wasAutoClosed,
      autoCloseTrigger,
      closureFeedback
    })
  }

  /**
   * Track closure detection event
   */
  async trackClosureDetection(details, similarityScore, thresholdPassed) {
    await trackAIEvent(this.sessionId, 'closure_detection', {
      details,
      similarityScore,
      thresholdPassed
    })
  }

  /**
   * Track classification event
   */
  async trackClassification(classificationResult, details) {
    await trackAIEvent(this.sessionId, 'classification', {
      classificationResult,
      details
    })
  }
}
