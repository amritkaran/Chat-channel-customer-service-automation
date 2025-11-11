/**
 * Session Manager
 * Handles 10-contact sessions with AI/Manual phases
 */

export class SessionManager {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.totalContacts = 10
    this.aiPhaseCount = 5
    this.contactsHandled = 0
    this.contacts = []
    this.startTime = Date.now()
    this.currentPhase = 'ai' // 'ai' or 'manual'
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  isAIEnabled() {
    return this.contactsHandled < this.aiPhaseCount
  }

  getCurrentPhase() {
    return this.contactsHandled < this.aiPhaseCount ? 'ai' : 'manual'
  }

  getProgress() {
    return {
      current: this.contactsHandled,
      total: this.totalContacts,
      percentage: (this.contactsHandled / this.totalContacts) * 100,
      phase: this.getCurrentPhase(),
      aiEnabled: this.isAIEnabled()
    }
  }

  startContact(contactId, customerName) {
    const aiEnabled = this.isAIEnabled()
    const contact = {
      id: contactId,
      customerName,
      aiEnabled,
      phase: this.getCurrentPhase(),
      startTime: Date.now(),
      endTime: null,
      handleTime: null,
      timeToClosure: null,
      lastMessageTime: null,
      messagesCount: 0,
      closureDetected: false,
      closureDetectedAt: null,
      autoClosed: false,
      manuallyClosed: false,
      sessionId: this.sessionId,
      sequenceNumber: this.contactsHandled + 1
    }

    this.contacts.push(contact)
    return contact
  }

  updateContact(contactId, updates) {
    const contact = this.contacts.find(c => c.id === contactId)
    if (contact) {
      Object.assign(contact, updates)
    }
  }

  endContact(contactId, closedType = 'manual') {
    const contact = this.contacts.find(c => c.id === contactId)
    if (contact && !contact.endTime) {
      contact.endTime = Date.now()
      contact.handleTime = contact.endTime - contact.startTime

      // Time to Closure = time from last message to contact closed
      if (contact.lastMessageTime) {
        contact.timeToClosure = contact.endTime - contact.lastMessageTime
      }

      contact.autoClosed = closedType === 'auto'
      contact.manuallyClosed = closedType === 'manual'

      this.contactsHandled++

      // Check if phase transition
      if (this.contactsHandled === this.aiPhaseCount) {
        this.currentPhase = 'manual'
        return {
          milestone: 'phase_transition',
          message: 'AI Phase Complete! Switching to Manual mode'
        }
      }

      // Check if session complete
      if (this.contactsHandled === this.totalContacts) {
        return {
          milestone: 'session_complete',
          message: 'Session Complete!',
          summary: this.generateSummary()
        }
      }
    }

    return null
  }

  markClosureDetected(contactId) {
    const contact = this.contacts.find(c => c.id === contactId)
    if (contact) {
      contact.closureDetected = true
      contact.closureDetectedAt = Date.now()
    }
  }

  incrementMessageCount(contactId, isAgent = false) {
    const contact = this.contacts.find(c => c.id === contactId)
    if (contact) {
      contact.messagesCount++
      // Update last message time (from either agent or customer)
      contact.lastMessageTime = Date.now()
    }
  }

  isSessionComplete() {
    return this.contactsHandled >= this.totalContacts
  }

  canAcceptNewContact() {
    return this.contactsHandled < this.totalContacts
  }

  generateSummary() {
    const aiContacts = this.contacts.filter(c => c.aiEnabled)
    const manualContacts = this.contacts.filter(c => !c.aiEnabled)

    const avgHandleTimeAI = this.calculateAverage(aiContacts.map(c => c.handleTime))
    const avgHandleTimeManual = this.calculateAverage(manualContacts.map(c => c.handleTime))

    const avgTimeToClosureAI = this.calculateAverage(
      aiContacts.filter(c => c.timeToClosure).map(c => c.timeToClosure)
    )

    const autoCloseRate = (aiContacts.filter(c => c.autoClosed).length / aiContacts.length) * 100
    const closureDetectionRate = (aiContacts.filter(c => c.closureDetected).length / aiContacts.length) * 100

    const timeSavedPerContact = avgHandleTimeManual - avgHandleTimeAI
    const totalTimeSaved = timeSavedPerContact * aiContacts.length

    const totalSessionTime = Date.now() - this.startTime

    return {
      sessionId: this.sessionId,
      totalContacts: this.totalContacts,
      contactsHandled: this.contactsHandled,
      totalSessionTime,

      aiMetrics: {
        count: aiContacts.length,
        avgHandleTime: avgHandleTimeAI,
        avgTimeToClosure: avgTimeToClosureAI,
        autoCloseRate,
        closureDetectionRate,
        avgMessagesPerContact: this.calculateAverage(aiContacts.map(c => c.messagesCount))
      },

      manualMetrics: {
        count: manualContacts.length,
        avgHandleTime: avgHandleTimeManual,
        avgMessagesPerContact: this.calculateAverage(manualContacts.map(c => c.messagesCount))
      },

      comparison: {
        handleTimeReduction: ((avgHandleTimeManual - avgHandleTimeAI) / avgHandleTimeManual) * 100,
        timeSavedPerContact,
        totalTimeSaved,
        messageReduction: this.calculateAverage(manualContacts.map(c => c.messagesCount)) -
                          this.calculateAverage(aiContacts.map(c => c.messagesCount))
      },

      contacts: this.contacts
    }
  }

  calculateAverage(numbers) {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  exportSession() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: Date.now(),
      totalContacts: this.totalContacts,
      contactsHandled: this.contactsHandled,
      contacts: this.contacts,
      summary: this.generateSummary()
    }
  }
}
