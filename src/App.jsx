import { useState, useEffect, useRef } from 'react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import './App.css'
import ChatContainer from './components/ChatContainer'
import ChatTabs from './components/ChatTabs'
import WorkspacePanel from './components/WorkspacePanel'
import IncomingContactBanner from './components/IncomingContactBanner'
import WelcomeScreen from './components/WelcomeScreen'
import MuteButton from './components/MuteButton'
import LogoutButton from './components/LogoutButton'
import QuickTips from './components/QuickTips'
import MetricsDashboard from './components/MetricsDashboard'
import SessionHeader from './components/SessionHeader'
import MilestoneNotification from './components/MilestoneNotification'
import SessionSummary from './components/SessionSummary'
import { getRandomCustomerName } from './utils/customerData'
import { audioService } from './utils/audioService'
import { SessionManager } from './utils/sessionManager'

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [activeChats, setActiveChats] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [incomingContact, setIncomingContact] = useState(null)
  const [nextContactId, setNextContactId] = useState(1)
  const [chatEndContactHandlers, setChatEndContactHandlers] = useState({})
  const [showMetricsDashboard, setShowMetricsDashboard] = useState(false)
  const [sessionManager, setSessionManager] = useState(null)
  const [milestone, setMilestone] = useState(null)
  const [sessionSummary, setSessionSummary] = useState(null)
  const [contactsStarted, setContactsStarted] = useState(false)

  const incomingTimeoutRef = useRef(null)
  const lastContactTimeRef = useRef(null)
  const sessionManagerRef = useRef(null)

  // Start taking contacts - show session structure page first
  const handleStartTakingContacts = () => {
    setHasStarted(true)
    // Initialize session manager
    const newSessionManager = new SessionManager()
    setSessionManager(newSessionManager)
    sessionManagerRef.current = newSessionManager
    console.log(`[Session] New session started: ${newSessionManager.sessionId}`)
    // Don't trigger contact automatically - wait for user to click button on session structure page
  }

  // Simulate incoming contacts with 20-second intervals
  useEffect(() => {
    if (!hasStarted || !contactsStarted) return

    const checkForNewContacts = setInterval(() => {
      // Only trigger new contact if:
      // 1. We have space (< 3 active chats, excluding closed ones)
      // 2. No pending incoming contact
      // 3. At least 20 seconds passed since last contact was accepted
      // 4. Session is not complete (< 10 contacts handled)
      const now = Date.now()
      const timeSinceLastContact = lastContactTimeRef.current
        ? now - lastContactTimeRef.current
        : Infinity

      const activeOpenChats = activeChats.filter(chat => !chat.isClosed).length
      const canAcceptNewContact = sessionManagerRef.current ? sessionManagerRef.current.canAcceptNewContact() : true

      if (activeOpenChats < 3 && !incomingContact && timeSinceLastContact >= 20000 && canAcceptNewContact) {
        triggerIncomingContact()
      }
    }, 5000) // Check every 5 seconds

    return () => {
      clearInterval(checkForNewContacts)
    }
  }, [hasStarted, contactsStarted, activeChats, incomingContact])

  const triggerIncomingContact = () => {
    const newContact = {
      id: nextContactId,
      customerName: getRandomCustomerName(),
    }

    setIncomingContact(newContact)
    setNextContactId(prev => prev + 1)

    // Note: Continuous ringing is now handled by IncomingContactBanner component

    // Auto-decline after 30 seconds
    incomingTimeoutRef.current = setTimeout(() => {
      console.log('Incoming contact auto-declined after 30s')
      setIncomingContact(null)
    }, 30000)
  }

  const acceptIncomingContact = () => {
    const activeOpenChats = activeChats.filter(chat => !chat.isClosed).length

    if (incomingContact && activeOpenChats < 3) {
      console.log(`Accepted contact: ${incomingContact.customerName}`)

      // Start contact in session manager
      let sessionContact = null
      let aiEnabled = true
      if (sessionManagerRef.current) {
        sessionContact = sessionManagerRef.current.startContact(incomingContact.id, incomingContact.customerName)
        aiEnabled = sessionContact.aiEnabled
        console.log(`[Session] Contact ${sessionContact.sequenceNumber}/10 started - AI ${aiEnabled ? 'ENABLED' : 'DISABLED'}`)
      }

      const newChat = {
        id: incomingContact.id,
        customerName: incomingContact.customerName,
        acceptedAt: Date.now(),
        issueResolved: false,
        unreadCount: 0,
        isClosed: false,
        aiEnabled: aiEnabled,
        sessionContact: sessionContact
      }
      setActiveChats(prev => [...prev, newChat])
      setActiveTabId(newChat.id)
      setIncomingContact(null)
      lastContactTimeRef.current = Date.now()

      if (incomingTimeoutRef.current) {
        clearTimeout(incomingTimeoutRef.current)
      }
    }
  }

  const updateChatIssueResolved = (chatId, resolved) => {
    setActiveChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, issueResolved: resolved } : chat
    ))
  }

  const updateChatClosed = (chatId, closed, closedType = 'manual') => {
    setActiveChats(prev => {
      const updated = prev.map(chat =>
        chat.id === chatId ? { ...chat, isClosed: closed } : chat
      )

      // End contact in session manager and check for milestones
      if (closed && sessionManagerRef.current) {
        const result = sessionManagerRef.current.endContact(chatId, closedType)
        if (result) {
          console.log(`[Session] Milestone reached: ${result.milestone}`)
          if (result.milestone === 'phase_transition') {
            setMilestone('phase_transition')
          } else if (result.milestone === 'session_complete') {
            setMilestone('session_complete')
            setSessionSummary(result.summary)
            console.log('[Session] Session complete! Summary:', result.summary)
            return updated // Don't trigger new contacts, session is complete
          }
        }
      }

      // Immediately trigger new contact when chat is closed (if session not complete)
      if (closed) {
        lastContactTimeRef.current = Date.now()
        setTimeout(() => {
          const canAcceptNewContact = sessionManagerRef.current ? sessionManagerRef.current.canAcceptNewContact() : true
          // Count active open chats from the updated state
          const activeOpenChats = updated.filter(chat => !chat.isClosed).length
          if (activeOpenChats < 3 && !incomingContact && canAcceptNewContact) {
            triggerIncomingContact()
          }
        }, 500)
      }

      return updated
    })
  }

  const incrementUnreadCount = (chatId) => {
    console.log(`[App] Incrementing unread count for chat ${chatId}`)

    // Play notification sound for unread message
    audioService.playMessageNotification()

    setActiveChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const newCount = chat.unreadCount + 1
        console.log(`[App] Chat ${chatId} unread count: ${chat.unreadCount} -> ${newCount}`)
        return { ...chat, unreadCount: newCount }
      }
      return chat
    }))
  }

  const resetUnreadCount = (chatId) => {
    console.log(`[App] Resetting unread count for chat ${chatId}`)
    setActiveChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ))
  }

  const handleTabChange = (newTabId) => {
    console.log(`[App] Tab changed to ${newTabId}`)
    setActiveTabId(newTabId)
    resetUnreadCount(newTabId)
  }

  const declineIncomingContact = () => {
    console.log('Declined incoming contact')
    setIncomingContact(null)
    if (incomingTimeoutRef.current) {
      clearTimeout(incomingTimeoutRef.current)
    }
  }

  const handleCloseTab = (chatId) => {
    console.log(`Closing chat tab: ${chatId}`)
    setActiveChats(prev => {
      const newChats = prev.filter(chat => chat.id !== chatId)

      // If we closed the active tab, switch to another tab
      if (chatId === activeTabId && newChats.length > 0) {
        setActiveTabId(newChats[0].id)
      }

      // After closing a tab, trigger a new incoming contact if we have space
      const activeOpenChats = newChats.filter(chat => !chat.isClosed).length
      if (activeOpenChats < 3) {
        setTimeout(() => {
          triggerIncomingContact()
        }, 2000) // Wait 2 seconds before showing new incoming contact
      }

      return newChats
    })
  }

  const handleEndContact = (chatId) => {
    // Call the end contact handler for this chat if it exists
    if (chatEndContactHandlers[chatId]) {
      chatEndContactHandlers[chatId]()
    }
  }

  const registerEndContactHandler = (chatId, handler) => {
    setChatEndContactHandlers(prev => ({
      ...prev,
      [chatId]: handler
    }))
  }

  const handleBeginContacts = () => {
    console.log('[Session] User clicked Start Taking Contacts - triggering first contact')
    setContactsStarted(true)
    // Trigger first contact immediately
    setTimeout(() => {
      triggerIncomingContact()
    }, 500)
  }

  const handleLogout = () => {
    console.log('Logging out - returning to welcome screen')
    // Reset all state to initial values
    setHasStarted(false)
    setActiveChats([])
    setActiveTabId(null)
    setIncomingContact(null)
    setNextContactId(1)
    setChatEndContactHandlers({})
    setSessionManager(null)
    setMilestone(null)
    setSessionSummary(null)
    setContactsStarted(false)

    // Clear any pending timers
    if (incomingTimeoutRef.current) {
      clearTimeout(incomingTimeoutRef.current)
    }

    lastContactTimeRef.current = null
    sessionManagerRef.current = null
  }

  const handleCloseFeedback = async (feedback) => {
    console.log(`Contact ${activeTabId} feedback: ${feedback}`)
    // Log feedback for analytics
    if (feedback === 'incorrect') {
      console.log(`⚠️ CSA reported incorrect auto-closure for contact ${activeTabId}`)
    } else {
      console.log(`✓ CSA confirmed correct auto-closure for contact ${activeTabId}`)
    }

    // Note: The actual metrics update with feedback happens in ChatContainer
    // when the contact ends. The feedback is stored in WorkspacePanel component.
    // In a full implementation, you'd need to pass the sessionId back up
    // and update the contact_sessions table with the closure_feedback field.

    // Close the tab after feedback
    handleCloseTab(activeTabId)
  }

  const handleCloseMilestone = () => {
    setMilestone(null)
  }

  const handleStartNewSession = () => {
    // Reset everything and start a new session
    console.log('[Session] Starting new session')
    setActiveChats([])
    setActiveTabId(null)
    setIncomingContact(null)
    setNextContactId(1)
    setChatEndContactHandlers({})
    setSessionSummary(null)
    setMilestone(null)

    // Create new session manager
    const newSessionManager = new SessionManager()
    setSessionManager(newSessionManager)
    sessionManagerRef.current = newSessionManager
    console.log(`[Session] New session started: ${newSessionManager.sessionId}`)

    // Clear timers
    if (incomingTimeoutRef.current) {
      clearTimeout(incomingTimeoutRef.current)
    }
    lastContactTimeRef.current = null

    // Trigger first contact
    setTimeout(() => {
      triggerIncomingContact()
    }, 500)
  }

  const handleViewDetails = () => {
    // For now, just log the summary. In a full implementation,
    // this would show a detailed report or navigate to a report page
    console.log('[Session] Viewing detailed report:', sessionSummary)
    alert('Detailed report functionality coming soon! Check console for summary data.')
  }

  const activeChat = activeChats.find(chat => chat.id === activeTabId)
  const hasActiveContacts = activeChats.some(chat => !chat.isClosed)

  if (!hasStarted) {
    return <WelcomeScreen onStartTakingContacts={handleStartTakingContacts} />
  }

  // Show session summary when session is complete
  if (sessionSummary) {
    return (
      <SessionSummary
        summary={sessionSummary}
        onStartNewSession={handleStartNewSession}
        onViewDetails={handleViewDetails}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="App">
      {milestone && (
        <MilestoneNotification
          milestone={milestone}
          onClose={handleCloseMilestone}
        />
      )}
      {showMetricsDashboard && (
        <MetricsDashboard onClose={() => setShowMetricsDashboard(false)} />
      )}
      {hasStarted && !incomingContact && (
        <div className="top-buttons-container">
          <button
            className="metrics-btn"
            onClick={() => setShowMetricsDashboard(true)}
            title="View Metrics Dashboard"
          >
            📊 Metrics
          </button>
          <LogoutButton onLogout={handleLogout} hasActiveContacts={hasActiveContacts} />
          <MuteButton />
        </div>
      )}
      {incomingContact && activeChats.filter(chat => !chat.isClosed).length < 3 && (
        <IncomingContactBanner
          contact={incomingContact}
          onAccept={acceptIncomingContact}
          onDecline={declineIncomingContact}
          onLogout={handleLogout}
          hasActiveContacts={hasActiveContacts}
          onShowMetrics={() => setShowMetricsDashboard(true)}
        />
      )}
      {sessionManager && (
        <SessionHeader sessionManager={sessionManager} />
      )}
      {activeChats.length > 0 && (
        <ChatTabs
          chats={activeChats}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          onCloseTab={handleCloseTab}
          onEndContact={handleEndContact}
        />
      )}
      {activeChats.length > 0 ? (
        <div className="main-content">
          <div className="chat-section">
            {activeChats.map(chat => (
              <div
                key={chat.id}
                style={{ display: chat.id === activeTabId ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%' }}
              >
                <ChatContainer
                  chatId={chat.id}
                  customerName={chat.customerName}
                  issueResolved={chat.issueResolved}
                  onIssueResolvedChange={(resolved) => updateChatIssueResolved(chat.id, resolved)}
                  isActiveTab={chat.id === activeTabId}
                  onNewCustomerMessage={() => incrementUnreadCount(chat.id)}
                  onCloseTab={handleCloseTab}
                  onClosedChange={(closed, closedType) => updateChatClosed(chat.id, closed, closedType)}
                  onRegisterEndContactHandler={registerEndContactHandler}
                  aiEnabled={chat.aiEnabled !== undefined ? chat.aiEnabled : true}
                  sessionManager={sessionManagerRef.current}
                />
              </div>
            ))}
          </div>
          <WorkspacePanel
            customerName={activeChat ? activeChat.customerName : ''}
            isContactClosed={activeChat ? activeChat.isClosed : false}
            onCloseFeedback={handleCloseFeedback}
          />
        </div>
      ) : (
        <div className="waiting-container">
          <div className="session-intro-card">
            <h2 className="session-intro-title">Your 10-Contact Session</h2>
            <p className="session-intro-subtitle">Experience the difference AI makes in customer service</p>

            <div className="session-phases-simple">
              <div className="phase-simple ai-phase-simple">
                <div className="phase-number">1-5</div>
                <div className="phase-content">
                  <h3>✨ AI-Assisted</h3>
                  <p>AI automatically detects when issues are resolved and closes contacts for you, improving efficiency</p>
                </div>
              </div>

              <div className="phase-simple manual-phase-simple">
                <div className="phase-number">6-10</div>
                <div className="phase-content">
                  <h3>👤 Manual Only</h3>
                  <p>Handle contacts without AI assistance - you'll manually close each contact yourself</p>
                </div>
              </div>
            </div>

            <button className="start-contacts-btn" onClick={handleBeginContacts}>
              🚀 Start Taking Contacts
            </button>
          </div>
        </div>
      )}
      {hasStarted && <QuickTips />}
    </div>
  )
}

export default App
