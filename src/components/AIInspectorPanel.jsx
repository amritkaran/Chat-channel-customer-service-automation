import { useState, useEffect } from 'react'
import './AIInspectorPanel.css'
import { aiEventLogger } from '../utils/aiEventLogger'

function AIInspectorPanel({ isOpen }) {
  const [events, setEvents] = useState([])
  const [expandedEvent, setExpandedEvent] = useState(null)

  useEffect(() => {
    // Subscribe to event updates
    const unsubscribe = aiEventLogger.subscribe((newEvents) => {
      setEvents(newEvents)
    })

    return () => unsubscribe()
  }, [])

  const handleClearEvents = () => {
    aiEventLogger.clearEvents()
  }

  const toggleEventExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const renderEventDetails = (event) => {
    switch (event.type) {
      case 'closure_detection':
        return renderClosureDetails(event.data)
      case 'classification':
        return renderClassificationDetails(event.data)
      case 'timer_change':
        return renderTimerDetails(event.data)
      case 'customer_message':
        return renderCustomerMessageDetails(event.data)
      case 'idle_detection':
        return renderIdleDetails(event.data)
      default:
        return null
    }
  }

  const renderClosureDetails = (data) => (
    <div className="event-details">
      <div className="detail-section">
        <strong>Agent Message:</strong>
        <div className="detail-value">"{data.message}"</div>
      </div>

      <div className="detail-section">
        <strong>Embedding Similarity Check:</strong>
        <div className="similarity-list">
          {data.top3Matches?.map((match, idx) => (
            <div key={idx} className="similarity-item">
              <span className="similarity-rank">{idx + 1}.</span>
              <span className="similarity-score">[{match.score.toFixed(3)}]</span>
              <span className="similarity-example">"{match.example}"</span>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <strong>Threshold Check:</strong>
        <div className="detail-value">
          Max: {data.maxSimilarity?.toFixed(3)} | Threshold: {data.threshold}
          {data.passed ? ' ✅ PASSED' : ' ❌ FAILED'}
        </div>
      </div>

      {data.passed && (
        <div className="detail-section">
          <strong>Action Taken:</strong>
          <div className="detail-value">Started 60-second auto-close countdown</div>
        </div>
      )}

      <div className="learning-tip">
        💡 <strong>Learn:</strong> Embeddings measure semantic similarity between messages, not exact word matching. This allows the system to recognize closure statements even when phrased differently.
      </div>
    </div>
  )

  const renderClassificationDetails = (data) => (
    <div className="event-details">
      <div className="detail-section">
        <strong>Customer Said:</strong>
        <div className="detail-value">"{data.customerMessage}"</div>
      </div>

      <div className="detail-section">
        <strong>LLM Analysis:</strong>
        <div className="detail-value">
          Model: {data.model}<br/>
          Classification: <span className={`classification-badge ${data.classification}`}>{data.classification}</span>
        </div>
      </div>

      {data.action && (
        <div className="detail-section">
          <strong>Action Taken:</strong>
          <div className="detail-value">{data.action}</div>
        </div>
      )}

      <div className="learning-tip">
        💡 <strong>Learn:</strong> The LLM reads the entire conversation context and applies specific rules to classify customer intent (needs_help / satisfied / uncertain).
      </div>

      {expandedEvent && (
        <div className="detail-section expandable">
          <button className="expand-btn" onClick={() => toggleEventExpand(null)}>
            Hide Full Prompts
          </button>
          <div className="prompt-display">
            <strong>System Prompt:</strong>
            <pre>{data.systemPrompt}</pre>
          </div>
        </div>
      )}
    </div>
  )

  const renderTimerDetails = (data) => (
    <div className="event-details">
      <div className="detail-section">
        <strong>Event:</strong>
        <div className="detail-value">{data.event}</div>
      </div>

      {data.reason && (
        <div className="detail-section">
          <strong>Why:</strong>
          <div className="detail-value">{data.reason}</div>
        </div>
      )}

      {data.before && (
        <div className="detail-section">
          <strong>Before:</strong>
          <div className="detail-value">{data.before}</div>
        </div>
      )}

      {data.after && (
        <div className="detail-section">
          <strong>After:</strong>
          <div className="detail-value">{data.after}</div>
        </div>
      )}

      {data.learningTip && (
        <div className="learning-tip">
          💡 <strong>Learn:</strong> {data.learningTip}
        </div>
      )}
    </div>
  )

  const renderCustomerMessageDetails = (data) => (
    <div className="event-details">
      <div className="detail-section">
        <strong>Generated Message:</strong>
        <div className="detail-value">"{data.message}"</div>
      </div>

      <div className="detail-section">
        <strong>Context Used:</strong>
        <div className="detail-value">{data.contextSize} previous messages</div>
      </div>

      <div className="learning-tip">
        💡 <strong>Learn:</strong> The customer simulator uses conversation history to generate realistic, context-aware responses using an LLM.
      </div>
    </div>
  )

  const renderIdleDetails = (data) => (
    <div className="event-details">
      <div className="detail-section">
        <strong>Idle Duration:</strong>
        <div className="detail-value">{data.idleTime} seconds</div>
      </div>

      <div className="detail-section">
        <strong>Action:</strong>
        <div className="detail-value">Auto-injected "Are you there?" message</div>
      </div>

      <div className="learning-tip">
        💡 <strong>Learn:</strong> After 45 seconds of agent inactivity, the system automatically prompts the agent to continue the conversation.
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="ai-inspector-panel">
      <div className="inspector-header">
        <h3>🔍 AI Inspector</h3>
        <p className="inspector-subtitle">Learning Mode - See how AI makes decisions</p>
        <button className="clear-btn" onClick={handleClearEvents}>
          Clear Events
        </button>
      </div>

      <div className="events-timeline">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No AI events yet</p>
            <p className="no-events-hint">AI decisions will appear here in real-time</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className={`event-card ${event.type}`}>
              <div className="event-header">
                <span className="event-icon">{event.icon}</span>
                <div className="event-title-group">
                  <span className="event-title">{event.title}</span>
                  <span className="event-time">{formatTime(event.timestamp)}</span>
                </div>
              </div>
              {renderEventDetails(event)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AIInspectorPanel
