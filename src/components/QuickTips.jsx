import { useState } from 'react'
import './QuickTips.css'

function QuickTips() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('quick_tips_dismissed') === 'true'
  })

  if (isDismissed) return null

  const closurePhrases = [
    "Is there anything else I can help you with?",
    "Can I assist you with anything else today?",
    "Do you have any other questions?",
    "Is there anything else you need help with?",
    "Would you like help with anything else?",
  ]

  const customerResponses = {
    satisfied: [
      '"No, that\'s all. Thank you!"',
      '"Nope, I\'m good now. Thanks!"',
      '"That\'s perfect, thanks for your help!"',
    ],
    needsHelp: [
      '"Actually, I have another question..."',
      '"Yes, I need help with something else"',
      '"Can you also help me with..."',
    ],
    uncertain: [
      '"I think that\'s it"',
      '"Maybe that\'s all"',
      '"I guess that works"',
    ]
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('quick_tips_dismissed', 'true')
  }

  return (
    <div className={`quick-tips ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="quick-tips-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="quick-tips-icon">💬</span>
        <span className="quick-tips-title">Quick Tips</span>
        <button
          className="quick-tips-close"
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          title="Dismiss permanently"
        >
          ✕
        </button>
      </div>

      {isExpanded && (
        <div className="quick-tips-content">
          <div className="tips-section">
            <h4>🎯 Try These Closure Statements:</h4>
            <ul className="tips-list">
              {closurePhrases.map((phrase, i) => (
                <li key={i} className="tip-item">
                  <button
                    className="copy-phrase-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(phrase)
                    }}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                  <span className="tip-text">"{phrase}"</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="tips-section">
            <h4>✅ Customer Says (Satisfied):</h4>
            <ul className="tips-list small">
              {customerResponses.satisfied.map((response, i) => (
                <li key={i} className="tip-item-small satisfied">
                  {response} → Fast-close 15s
                </li>
              ))}
            </ul>
          </div>

          <div className="tips-section">
            <h4>❌ Customer Says (Needs Help):</h4>
            <ul className="tips-list small">
              {customerResponses.needsHelp.map((response, i) => (
                <li key={i} className="tip-item-small needs-help">
                  {response} → Timer cancels
                </li>
              ))}
            </ul>
          </div>

          <div className="tips-section">
            <h4>⏱️ Customer Says (Uncertain):</h4>
            <ul className="tips-list small">
              {customerResponses.uncertain.map((response, i) => (
                <li key={i} className="tip-item-small uncertain">
                  {response} → Standard 60s
                </li>
              ))}
            </ul>
          </div>

          <div className="tips-footer">
            <p>💡 Turn on AI Inspector to see classification in real-time!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickTips
