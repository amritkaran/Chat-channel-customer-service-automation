import { useState, useEffect } from 'react'
import './ChatTabs.css'

function ChatTabs({ chats, activeTabId, onTabChange, onCloseTab, onEndContact }) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update time every second for handle time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatHandleTime = (acceptedAt) => {
    const elapsed = Math.floor((currentTime - acceptedAt) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleEndContactClick = (e, chatId) => {
    e.stopPropagation() // Prevent tab change
    if (onEndContact) {
      onEndContact(chatId)
    }
  }

  return (
    <div className="chat-tabs">
      {chats.map((chat) => {
        const isActive = activeTabId === chat.id
        return (
          <div
            key={chat.id}
            className={`chat-tab ${isActive ? 'active' : ''} ${chat.unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => onTabChange(chat.id)}
          >
            <div className="tab-content">
              <div className="tab-info">
                <span className="tab-name">{chat.customerName}</span>
                {chat.isClosed ? (
                  <span className="tab-auto-closed">Auto-Closed</span>
                ) : (
                  <span className="tab-handle-time">{formatHandleTime(chat.acceptedAt)}</span>
                )}
              </div>
              {chat.unreadCount > 0 && (
                <span className="unread-badge">{chat.unreadCount}</span>
              )}
            </div>
            {isActive && !chat.isClosed && (
              <button
                className="end-contact-btn"
                onClick={(e) => handleEndContactClick(e, chat.id)}
                title="End this contact"
              >
                <span className="stop-icon">⏹</span> End Contact
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ChatTabs
