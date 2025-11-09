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
import { getRandomCustomerName } from './utils/customerData'
import { audioService } from './utils/audioService'

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [activeChats, setActiveChats] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [incomingContact, setIncomingContact] = useState(null)
  const [nextContactId, setNextContactId] = useState(1)
  const [chatEndContactHandlers, setChatEndContactHandlers] = useState({})
  const [showMetricsDashboard, setShowMetricsDashboard] = useState(false)

  const incomingTimeoutRef = useRef(null)
  const lastContactTimeRef = useRef(null)

  // Start taking contacts - trigger first incoming contact
  const handleStartTakingContacts = () => {
    setHasStarted(true)
    // Show first incoming contact immediately
    setTimeout(() => {
      triggerIncomingContact()
    }, 500)
  }

  // Simulate incoming contacts with 20-second intervals
  useEffect(() => {
    if (!hasStarted) return

    const checkForNewContacts = setInterval(() => {
      // Only trigger new contact if:
      // 1. We have space (< 3 active chats, excluding closed ones)
      // 2. No pending incoming contact
      // 3. At least 20 seconds passed since last contact was accepted
      const now = Date.now()
      const timeSinceLastContact = lastContactTimeRef.current
        ? now - lastContactTimeRef.current
        : Infinity

      const activeOpenChats = activeChats.filter(chat => !chat.isClosed).length

      if (activeOpenChats < 3 && !incomingContact && timeSinceLastContact >= 20000) {
        triggerIncomingContact()
      }
    }, 5000) // Check every 5 seconds

    return () => {
      clearInterval(checkForNewContacts)
    }
  }, [hasStarted, activeChats, incomingContact])

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
      const newChat = {
        id: incomingContact.id,
        customerName: incomingContact.customerName,
        acceptedAt: Date.now(),
        issueResolved: false,
        unreadCount: 0,
        isClosed: false
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

  const updateChatClosed = (chatId, closed) => {
    setActiveChats(prev => {
      const updated = prev.map(chat =>
        chat.id === chatId ? { ...chat, isClosed: closed } : chat
      )

      // Immediately trigger new contact when chat is closed
      if (closed) {
        lastContactTimeRef.current = Date.now()
        setTimeout(() => {
          // Count active open chats from the updated state
          const activeOpenChats = updated.filter(chat => !chat.isClosed).length
          if (activeOpenChats < 3 && !incomingContact) {
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

  const handleLogout = () => {
    console.log('Logging out - returning to welcome screen')
    // Reset all state to initial values
    setHasStarted(false)
    setActiveChats([])
    setActiveTabId(null)
    setIncomingContact(null)
    setNextContactId(1)
    setChatEndContactHandlers({})

    // Clear any pending timers
    if (incomingTimeoutRef.current) {
      clearTimeout(incomingTimeoutRef.current)
    }

    lastContactTimeRef.current = null
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

  const activeChat = activeChats.find(chat => chat.id === activeTabId)
  const hasActiveContacts = activeChats.some(chat => !chat.isClosed)

  if (!hasStarted) {
    return <WelcomeScreen onStartTakingContacts={handleStartTakingContacts} />
  }

  return (
    <div className="App">
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
                  onClosedChange={(closed) => updateChatClosed(chat.id, closed)}
                  onRegisterEndContactHandler={registerEndContactHandler}
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
          <div className="waiting-message">
            <h2>Ready to Assist</h2>
            <p>Waiting for incoming contacts...</p>
          </div>
        </div>
      )}
      {hasStarted && <QuickTips />}
    </div>
  )
}

export default App
