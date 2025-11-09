import { useState } from 'react'
import './WorkspacePanel.css'

function WorkspacePanel({ customerName, isContactClosed, onCloseFeedback }) {
  const [isGuideExpanded, setIsGuideExpanded] = useState(true)

  return (
    <div className="workspace-panel">
      {isContactClosed && (
        <>
          <div className="workspace-overlay"></div>
          <div className="feedback-modal">
            <div className="feedback-modal-content">
              <h2 className="feedback-title">Contact Auto-Closed</h2>
              <p className="feedback-message">
                This contact was automatically closed based on the conversation.
              </p>
              <p className="feedback-question">Was this auto-closure correct?</p>
              <div className="feedback-buttons">
                <button
                  className="feedback-btn correct"
                  onClick={() => onCloseFeedback('correct')}
                >
                  <span className="feedback-icon">👍</span>
                  <span>Correct</span>
                </button>
                <button
                  className="feedback-btn incorrect"
                  onClick={() => onCloseFeedback('incorrect')}
                >
                  <span className="feedback-icon">👎</span>
                  <span>Incorrect</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="workspace-header">
        <h3>Customer Account Dashboard</h3>
        <p className="customer-name">{customerName}</p>
      </div>
      <div className="workspace-content">
        {/* Workflow Guide */}
        <div className="workflow-guide-section">
          <div
            className="workflow-guide-header"
            onClick={() => setIsGuideExpanded(!isGuideExpanded)}
          >
            <div className="guide-header-left">
              <span className="guide-icon">🎓</span>
              <h4 className="guide-title">Customer Service Workflow Guide</h4>
            </div>
            <button className="guide-toggle-btn">
              {isGuideExpanded ? '−' : '+'}
            </button>
          </div>

          {isGuideExpanded && (
            <div className="workflow-guide-content">
              <div className="workflow-stages">
                {/* Stage 1: Acknowledge */}
                <div className="workflow-stage">
                  <div className="stage-header">
                    <div className="stage-number">1</div>
                    <h5 className="stage-title">Acknowledge</h5>
                  </div>
                  <div className="stage-description">
                    <p className="stage-text">
                      <strong>Greet</strong> the customer, <strong>apologize</strong> for the inconvenience, and <strong>understand the exact details</strong> to help identify the customer issue.
                    </p>
                    <div className="stage-example">
                      <span className="example-label">💬 Example:</span>
                      <span className="example-text">"Hello! I'm sorry to hear you're having trouble. Can you tell me more about the issue so I can help you?"</span>
                    </div>
                  </div>
                </div>

                {/* Stage 2: Act */}
                <div className="workflow-stage">
                  <div className="stage-header">
                    <div className="stage-number">2</div>
                    <h5 className="stage-title">Act</h5>
                  </div>
                  <div className="stage-description">
                    <p className="stage-text">
                      <strong>Provide resolution</strong> to address the customer's issue based on their situation.
                    </p>
                    <div className="stage-example">
                      <span className="example-label">💬 Examples:</span>
                      <div className="example-text-list">
                        <p>"I've sent a password reset link to your email. You should receive it within 5 minutes."</p>
                        <p>"I've issued a full refund of $49.99. It will appear in your account within 3-5 business days."</p>
                        <p>"I'm escalating this to our technical team. They'll contact you within 24 hours to resolve this."</p>
                        <p>"I've updated your shipping address. Your order will now be delivered to the new address."</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Closure */}
                <div className="workflow-stage">
                  <div className="stage-header">
                    <div className="stage-number">3</div>
                    <h5 className="stage-title">Closure</h5>
                  </div>
                  <div className="stage-description">
                    <p className="stage-text">
                      <strong>Ask if their issue is resolved</strong> and check if they need help with <strong>any other issue</strong>.
                    </p>
                    <div className="stage-example">
                      <span className="example-label">💬 Example:</span>
                      <span className="example-text">"Is there anything else I can help you with today?"</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="workflow-tip">
                💡 <strong>Pro Tip:</strong> Following this 3-stage workflow ensures quality customer service and helps the AI accurately detect when conversations are ready to close.
              </div>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="section">
          <h4 className="section-title">Account Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Customer ID</span>
              <span className="info-value">---</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">---</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">---</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">---</span>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="section">
          <h4 className="section-title">Recent Orders</h4>
          <div className="placeholder-table">
            <div className="table-header">
              <span>Order ID</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
            </div>
            <div className="table-empty">
              <p>Order details will appear here</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h4 className="section-title">Quick Actions</h4>
          <div className="actions-grid">
            <button className="action-btn" disabled>View Orders</button>
            <button className="action-btn" disabled>Process Refund</button>
            <button className="action-btn" disabled>Update Account</button>
            <button className="action-btn" disabled>Send Email</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePanel
