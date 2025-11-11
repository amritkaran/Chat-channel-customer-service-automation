import { useState, useRef, useEffect } from 'react'
import {
  MainContainer,
  ChatContainer as CSChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Avatar,
} from '@chatscope/chat-ui-kit-react'
import { detectClosureStatement } from '../utils/closureDetector'
import { generateCustomerMessage } from '../utils/llmService'
import { getOpeningStatement } from '../utils/customerData'
import { classifyCustomerResponse } from '../utils/responseClassifier'
import { aiEventLogger } from '../utils/aiEventLogger'
import { ContactSessionTracker } from '../utils/metricsService'
import ConfirmModal from './ConfirmModal'
import MessageAIBadge from './MessageAIBadge'
import AIDetailPopup from './AIDetailPopup'
import Hint from './Hint'
import './ChatContainer.css'

function ChatContainer({ chatId, customerName, issueResolved, onIssueResolvedChange, isActiveTab, onNewCustomerMessage, onCloseTab, onClosedChange, onRegisterEndContactHandler, aiEnabled = true, sessionManager = null }) {
  const [messages, setMessages] = useState([
    {
      message: getOpeningStatement(),
      sentTime: new Date().toISOString(),
      sender: "customer",
      direction: "incoming",
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [closureDetected, setClosureDetected] = useState(false)
  const [isManualClose, setIsManualClose] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [totalCloseTime, setTotalCloseTime] = useState(0)
  const [hasEverBeenResolved, setHasEverBeenResolved] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [isFastClose, setIsFastClose] = useState(false) // 15s mode when customer is satisfied
  const [aiInspectorEnabled, setAIInspectorEnabled] = useState(false)
  const [messageAIEvents, setMessageAIEvents] = useState({}) // Map of message index to AI event data
  const [activePopup, setActivePopup] = useState(null) // {type, data, index}

  const closeTimerRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const pauseTimeRef = useRef(0)
  const conversationContextRef = useRef([])
  const lastAgentMessageTimeRef = useRef(null) // Initialized when chat opens, updated on each agent message
  const idleCheckIntervalRef = useRef(null)
  const isActiveTabRef = useRef(isActiveTab)
  const onNewCustomerMessageRef = useRef(onNewCustomerMessage)
  const issueResolvedRef = useRef(issueResolved)
  const isClosedRef = useRef(isClosed)
  const isTypingRef = useRef(isTyping)
  const hasEverBeenResolvedRef = useRef(hasEverBeenResolved)
  const lastClassifiedMessageIndexRef = useRef(-1) // Track last classified message to prevent duplicates
  const countdownRef = useRef(countdown)
  const metricsTrackerRef = useRef(null) // Metrics tracking for this contact session

  // Keep refs updated
  useEffect(() => {
    isActiveTabRef.current = isActiveTab
    onNewCustomerMessageRef.current = onNewCustomerMessage
    issueResolvedRef.current = issueResolved
    isClosedRef.current = isClosed
    isTypingRef.current = isTyping
    hasEverBeenResolvedRef.current = hasEverBeenResolved
    countdownRef.current = countdown
  }, [isActiveTab, onNewCustomerMessage, issueResolved, isClosed, isTyping, hasEverBeenResolved, countdown])

  // Register the end contact handler
  useEffect(() => {
    if (onRegisterEndContactHandler) {
      onRegisterEndContactHandler(chatId, handleManualCloseClick)
    }
  }, [chatId, onRegisterEndContactHandler])

  // Initialize idle detection timer immediately when chat opens
  useEffect(() => {
    lastAgentMessageTimeRef.current = Date.now()
    console.log(`[Chat ${chatId}] Idle detection initialized - will trigger after 45 seconds of inactivity`)
  }, [])

  // Initialize metrics tracker for this contact session
  useEffect(() => {
    const sessionId = `contact_${chatId}_${Date.now()}`
    metricsTrackerRef.current = new ContactSessionTracker(sessionId, customerName)
    metricsTrackerRef.current.start()
    console.log(`[Metrics] Started tracking session: ${sessionId}`)

    return () => {
      console.log(`[Metrics] Session cleanup for chat ${chatId}`)
    }
  }, [chatId, customerName])

  useEffect(() => {
    conversationContextRef.current = messages.map(msg => ({
      role: msg.sender === 'customer' ? 'customer' : 'agent',
      content: msg.message
    }))

    // Classify customer response when they message during countdown - only if AI is enabled
    const handleCustomerResponseClassification = async () => {
      if (aiEnabled && closureDetected && messages.length > 0 && !isClosedRef.current) {
        const currentMessageIndex = messages.length - 1
        const lastMessage = messages[currentMessageIndex]

        // Only classify if this is a new customer message we haven't classified yet
        if (lastMessage.sender === 'customer' && currentMessageIndex > lastClassifiedMessageIndexRef.current) {
          lastClassifiedMessageIndexRef.current = currentMessageIndex
          console.log('Customer responded during countdown - classifying response...')
          const classificationResult = await classifyCustomerResponse(conversationContextRef.current, true)
          const classification = classificationResult.classification

          // Store and log classification event
          if (classificationResult.details) {
            const logData = {
              ...classificationResult.details,
              classification
            }

            if (classification === 'needs_help') {
              logData.action = 'Canceled auto-closure, timer stopped, issue marked as unresolved'
            } else if (classification === 'satisfied') {
              logData.action = 'Switched to fast-close mode (15 seconds)'
            } else {
              logData.action = 'Timer continues (response unclear)'
            }

            // Store classification data for this message
            setMessageAIEvents(prev => ({
              ...prev,
              [currentMessageIndex]: { type: 'classification', data: logData }
            }))

            aiEventLogger.logClassification(logData)

            // Track classification event in metrics
            if (metricsTrackerRef.current) {
              metricsTrackerRef.current.trackClassification(classification, classificationResult.details)
            }
          }

          if (classification === 'needs_help') {
            console.log('Customer needs more help - canceling auto-closure')
            stopCountdown()
            setClosureDetected(false)
            setIsFastClose(false)
            lastClassifiedMessageIndexRef.current = -1 // Reset to stop further classifications
            onIssueResolvedChange(false) // Mark issue as not resolved

            // Log timer cancellation
            aiEventLogger.logTimerChange({
              event: 'Timer Canceled',
              reason: 'Customer classified as "needs_help"',
              before: 'Countdown active',
              after: 'Timer stopped',
              learningTip: 'When the customer indicates they need more help, the auto-closure is canceled and the issue is marked as unresolved.'
            })
          } else if (classification === 'satisfied') {
            console.log('Customer is satisfied - switching to fast close (15s)')
            // Only switch to 15s if current remaining time > 15s
            const currentCountdown = countdownRef.current
            if (currentCountdown > 15000) {
              stopCountdown()
              setIsFastClose(true)
              const closeDelay = 15000 // 15 seconds
              startCountdown(closeDelay)

              // Log timer switch
              aiEventLogger.logTimerChange({
                event: 'Timer Switched to Fast Close',
                reason: 'Customer classified as "satisfied"',
                before: '60s countdown (more than 15s remaining)',
                after: '15s countdown',
                learningTip: 'When the customer indicates satisfaction, the system speeds up closure to improve efficiency.'
              })
            } else {
              // Just mark as fast close for visual indicator
              setIsFastClose(true)
            }
          } else {
            console.log('Customer response uncertain - continuing current timer')
            // Keep existing timer running
          }
        }
      }
    }

    handleCustomerResponseClassification()
  }, [messages, closureDetected])

  const startCountdown = (totalTime) => {
    setTotalCloseTime(totalTime)
    setCountdown(totalTime)

    const startTime = Date.now()
    const pauseTracker = { totalPauseTime: 0, pauseStartTime: null }

    countdownIntervalRef.current = setInterval(() => {
      setIsUserTyping(currentlyTyping => {
        // Track pause time
        if (currentlyTyping) {
          if (pauseTracker.pauseStartTime === null) {
            pauseTracker.pauseStartTime = Date.now()
          }
          return currentlyTyping
        } else {
          if (pauseTracker.pauseStartTime !== null) {
            pauseTracker.totalPauseTime += Date.now() - pauseTracker.pauseStartTime
            pauseTracker.pauseStartTime = null
          }

          const elapsed = Date.now() - startTime - pauseTracker.totalPauseTime
          const remaining = Math.max(0, totalTime - elapsed)
          setCountdown(remaining)

          if (remaining <= 0) {
            clearInterval(countdownIntervalRef.current)
            setIsClosed(true)
            console.log('Contact closed automatically')

            // Track auto-close in metrics
            if (metricsTrackerRef.current) {
              const trigger = isFastClose ? 'satisfied' : 'timer_expired'
              metricsTrackerRef.current.end(true, trigger) // wasAutoClosed=true
            }

            // Notify parent that contact is closed so new contact can be triggered immediately
            if (onClosedChange) {
              onClosedChange(true, 'auto') // Pass closedType as 'auto'
            }
          }

          return currentlyTyping
        }
      })
    }, 100)
  }

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const handleRevertClosure = () => {
    stopCountdown()
    setClosureDetected(false)
    setIsFastClose(false)
    setCountdown(0)
    setTotalCloseTime(0)
    lastClassifiedMessageIndexRef.current = -1 // Reset classification tracker
    onIssueResolvedChange(false) // Mark issue as not resolved
    console.log('Auto-closure reverted by CSA - issue marked as not resolved')
  }

  const handleSendMessage = async (messageText) => {
    if (isClosed) return

    setIsUserTyping(false)

    // Update last agent message time
    lastAgentMessageTimeRef.current = Date.now()

    // Detect closure FIRST (before adding message) - only if AI is enabled
    let closureResult = { isClosure: false, details: null }
    if (aiEnabled) {
      closureResult = await detectClosureStatement(messageText, true)
    }
    const isClosure = closureResult.isClosure

    const newMessage = {
      message: messageText,
      sentTime: new Date().toISOString(),
      sender: "agent",
      direction: "outgoing",
    }

    // Add message to state and store AI event in the same update
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage]
      const messageIndex = updatedMessages.length - 1  // Get correct index from updated array

      // Store AI event data for this message if we have details
      if (closureResult.details) {
        // Use setTimeout to ensure state update happens after messages update
        setTimeout(() => {
          setMessageAIEvents(prev => ({
            ...prev,
            [messageIndex]: { type: 'closure', data: closureResult.details }
          }))
        }, 0)

        // Log closure detection event
        aiEventLogger.logClosureDetection(closureResult.details)
      }

      return updatedMessages
    })

    // Track agent message in metrics
    if (metricsTrackerRef.current) {
      metricsTrackerRef.current.incrementMessage(true) // true = agent message
      metricsTrackerRef.current.update()
    }

    // Track message in session manager
    if (sessionManager) {
      sessionManager.incrementMessageCount(chatId, true) // true = agent message
    }

    if (isClosure && !closureDetected) {
      setClosureDetected(true)
      setIsFastClose(false) // Start with normal 60s mode
      lastClassifiedMessageIndexRef.current = -1 // Reset classification tracker for new closure
      setHasEverBeenResolved(true) // Mark that resolution was attempted
      onIssueResolvedChange(true) // Mark issue as resolved
      console.log('Closure statement detected! Issue marked as resolved. Contact will close in 60 seconds...')

      // Track closure detection in metrics
      if (metricsTrackerRef.current && closureResult.details) {
        metricsTrackerRef.current.markClosureDetected()
        metricsTrackerRef.current.trackClosureDetection(
          closureResult.details,
          closureResult.details.maxSimilarity,
          closureResult.details.passed
        )
        metricsTrackerRef.current.update()
      }

      // Mark closure detected in session manager
      if (sessionManager) {
        sessionManager.markClosureDetected(chatId)
      }

      const closeDelay = 60000 // 60 seconds
      startCountdown(closeDelay)

      // Log timer start event
      aiEventLogger.logTimerChange({
        event: 'Timer Started',
        reason: 'Closure statement detected',
        after: '60 seconds countdown',
        learningTip: 'When a closure statement is detected, a 60-second countdown begins before automatically closing the contact.'
      })
    }

    if (isClosure && closureDetected) {
      console.log('Closure statement sent again - timer continues, classification tracker reset')
      lastClassifiedMessageIndexRef.current = -1 // Reset classification tracker so next customer response can be classified
      // Timer continues counting down - do not reset
    }

    if (!isClosed) {
      setIsTyping(true)

      try {
        const customerResponse = await generateCustomerMessage(conversationContextRef.current)

        // Detect if this is a "thank you" or satisfaction response
        const isThankYouResponse = /thank|thanks|appreciate|perfect|great|good|all set|that'?s all|no.*else/i.test(customerResponse)

        // Use longer delay for thank you responses (8-12 seconds), normal delay otherwise (1-10 seconds)
        const randomDelay = isThankYouResponse
          ? 8000 + Math.random() * 4000  // 8-12 seconds for thank you
          : 1000 + Math.random() * 9000  // 1-10 seconds for normal messages

        setTimeout(() => {
          const customerMessage = {
            message: customerResponse,
            sentTime: new Date().toISOString(),
            sender: "customer",
            direction: "incoming",
          }

          setMessages(prevMessages => [...prevMessages, customerMessage])
          setIsTyping(false)

          // Track customer message in metrics
          if (metricsTrackerRef.current) {
            metricsTrackerRef.current.incrementMessage(false) // false = customer message
            metricsTrackerRef.current.update()
          }

          // Track customer message in session manager
          if (sessionManager) {
            sessionManager.incrementMessageCount(chatId, false) // false = customer message
          }

          // If this tab is not active, increment unread count
          if (!isActiveTabRef.current) {
            console.log(`[Chat ${chatId}] New customer message in inactive tab - incrementing unread count`)
            onNewCustomerMessageRef.current()
          }
        }, randomDelay)
      } catch (error) {
        console.error('Error generating customer response:', error)
        setIsTyping(false)
      }
    }
  }

  const typingTimeoutRef = useRef(null)

  const handleInputChange = (value) => {
    if (closureDetected) {
      // User is typing, set to true
      if (value.length > 0) {
        if (!isUserTyping) {
          console.log('User started typing - pausing countdown')
          setIsUserTyping(true)
        }

        // Clear any existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        // Set a timeout to detect when user stops typing
        typingTimeoutRef.current = setTimeout(() => {
          console.log('User stopped typing - resuming countdown')
          setIsUserTyping(false)
        }, 1000) // 1 second after last keystroke
      } else {
        // Input is empty, user stopped typing
        setIsUserTyping(false)
      }
    }
  }

  // Idle detection - auto-inject "Are you there?" if CSA is idle for 45 seconds
  // Each chat has its own independent timer
  // Starts immediately when chat opens
  // Stops permanently once a closure statement has been detected (even if canceled)
  useEffect(() => {
    // Check every 1 second for precise timing
    idleCheckIntervalRef.current = setInterval(() => {
      // Use refs to get current values
      if (isClosedRef.current || hasEverBeenResolvedRef.current) {
        // Don't check for idle if:
        // 1. Chat is closed, OR
        // 2. A closure statement has EVER been detected (even if canceled)
        return
      }

      const now = Date.now()
      const timeSinceLastAgentMessage = now - lastAgentMessageTimeRef.current

      // If 45 seconds passed since last agent message, inject "Are you there?"
      if (timeSinceLastAgentMessage >= 45000 && !isTypingRef.current) {
        console.log(`[Chat ${chatId}] CSA idle for 45 seconds - auto-injecting "Are you there?" message`)

        // Log idle detection event
        aiEventLogger.logIdleDetection({
          idleTime: 45,
          message: 'Are you there?'
        })

        const areYouThereMessage = {
          message: "Are you there?",
          sentTime: new Date().toISOString(),
          sender: "customer",
          direction: "incoming",
        }

        setMessages(prevMessages => [...prevMessages, areYouThereMessage])

        // If this tab is not active, increment unread count
        if (!isActiveTabRef.current) {
          console.log(`[Chat ${chatId}] "Are you there?" in inactive tab - incrementing unread count`)
          onNewCustomerMessageRef.current()
        }

        // Reset the timer to avoid repeated injections (wait another 45 seconds)
        lastAgentMessageTimeRef.current = now
      }
    }, 1000) // Check every second

    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current)
      }
    }
  }, [chatId]) // Only depends on chatId, uses refs for dynamic values

  useEffect(() => {
    return () => {
      stopCountdown()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current)
      }
    }
  }, [])

  const handleCloseFeedback = (feedback) => {
    console.log(`Contact ${chatId} feedback: ${feedback}`)
    // Log feedback for analytics
    if (feedback === 'incorrect') {
      console.log(`⚠️ CSA reported incorrect auto-closure for contact ${chatId}`)
    } else {
      console.log(`✓ CSA confirmed correct auto-closure for contact ${chatId}`)
    }

    // Close the tab after feedback
    if (onCloseTab) {
      onCloseTab(chatId)
    }
  }

  const handleManualCloseClick = () => {
    setShowCloseConfirm(true)
  }

  const handleConfirmManualClose = () => {
    console.log(`Manual close confirmed for contact ${chatId}`)
    stopCountdown()
    setShowCloseConfirm(false)

    // Track manual close in metrics
    if (metricsTrackerRef.current) {
      metricsTrackerRef.current.end(false, 'manual') // wasAutoClosed=false
    }

    // For manual close, destroy the tab completely and trigger new contact
    if (onClosedChange) {
      onClosedChange(true, 'manual') // Pass closedType as 'manual'
    }

    // Close the tab after a brief delay to allow state updates
    setTimeout(() => {
      if (onCloseTab) {
        onCloseTab(chatId)
      }
    }, 100)
  }

  const handleCancelManualClose = () => {
    setShowCloseConfirm(false)
  }


  const formatCountdown = (ms) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  return (
    <div className="chat-wrapper">
      {showCloseConfirm && (
        <ConfirmModal
          message="Are you sure you want to manually close this contact?"
          onConfirm={handleConfirmManualClose}
          onCancel={handleCancelManualClose}
        />
      )}
      <div className="chat-header">
        <div className="header-left">
          <div style={{ position: 'relative' }}>
            <button
              className={`ai-inspector-toggle ${aiInspectorEnabled ? 'active' : ''} ${!aiEnabled ? 'disabled' : ''}`}
              onClick={() => aiEnabled && setAIInspectorEnabled(!aiInspectorEnabled)}
              disabled={!aiEnabled}
              title={!aiEnabled ? 'AI Inspector is disabled for manual contacts' : aiInspectorEnabled ? 'AI Inspector is active - Click to hide AI analysis badges' : 'Click to enable AI Inspector and see detailed AI analysis'}
            >
              <span className="toggle-icon">{aiInspectorEnabled ? '💡' : '🔦'}</span>
              <span className="toggle-label">AI Inspector</span>
              {!aiEnabled && <span className="disabled-badge">👤 Manual</span>}
            </button>
            {!aiInspectorEnabled && Object.keys(messageAIEvents).length === 0 && (
              <Hint
                message="Turn on AI Inspector to see how embeddings and LLM classify messages in real-time!"
                position="bottom"
                storageKey="ai_inspector_intro"
                showDelay={2000}
                autoHide={true}
                autoHideDelay={10000}
              />
            )}
          </div>
          <h3>Customer Service Chat</h3>
        </div>
        {isClosed ? (
          <div className="closed-status">
            <span className="closed-text">Contact Closed</span>
          </div>
        ) : (
          <>
            {closureDetected && (
              <div style={{ position: 'relative' }}>
                <div className={`closure-indicator ${isFastClose ? 'fast-close' : ''}`}>
                  <span className="countdown-text">
                    {isUserTyping ? (
                      <>⏸ Paused - Typing...</>
                    ) : isFastClose ? (
                      <>⏳ Closing soon... {formatCountdown(countdown)}</>
                    ) : (
                      <>Auto-closing in {formatCountdown(countdown)}</>
                    )}
                  </span>
                  <button
                  className="revert-btn"
                  onClick={handleRevertClosure}
                  title="Cancel auto-closure"
                >
                  ✕ Cancel
                </button>
                </div>
                <Hint
                  message={isFastClose ? "Customer is satisfied! Fast-close (15s) activated. Click 'Cancel' to revert." : "AI detected closure statement! Timer will adapt based on customer's response."}
                  position="bottom"
                  storageKey="first_closure_detected"
                  showDelay={500}
                  autoHide={true}
                  autoHideDelay={8000}
                />
              </div>
            )}
          </>
        )}
      </div>
      <MainContainer style={{ position: 'relative' }}>
        <CSChatContainer>
          <MessageList
            typingIndicator={isTyping ? <TypingIndicator content="Customer is typing" /> : null}
          >
            {messages.map((message, i) => {
              const isCustomer = message.sender === 'customer'
              const aiEvent = messageAIEvents[i]

              return (
                <Message key={i} model={message}>
                  <Avatar
                    src={isCustomer ? null : null}
                    name={isCustomer ? 'Customer' : 'Agent'}
                    className={isCustomer ? 'customer-avatar' : 'agent-avatar'}
                  />
                  <Message.CustomContent>
                    <span className="message-text">{message.message}</span>
                    {aiInspectorEnabled && aiEvent && (
                      <MessageAIBadge
                        type={aiEvent.type}
                        data={aiEvent.data}
                        onClick={() => setActivePopup({ type: aiEvent.type, data: aiEvent.data, index: i })}
                      />
                    )}
                  </Message.CustomContent>
                </Message>
              )
            })}
          </MessageList>
          {aiInspectorEnabled && Object.keys(messageAIEvents).length > 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10000 }}>
              <Hint
                message="Click any colored badge next to messages to see detailed AI analysis!"
                position="top"
                storageKey="badge_click_hint"
                showDelay={1000}
                autoHide={true}
                autoHideDelay={7000}
              />
            </div>
          )}
          <MessageInput
            placeholder={isClosed ? "Contact closed" : "Type your message here"}
            onSend={handleSendMessage}
            onChange={handleInputChange}
            attachButton={false}
            disabled={isClosed}
          />
        </CSChatContainer>
      </MainContainer>

      {/* AI Detail Popup */}
      {activePopup && (
        <AIDetailPopup
          type={activePopup.type}
          data={activePopup.data}
          onClose={() => setActivePopup(null)}
        />
      )}
    </div>
  )
}

export default ChatContainer
