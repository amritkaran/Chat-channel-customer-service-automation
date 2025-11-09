import './WorkspacePanel.css'

function WorkspacePanel({ customerName, isContactClosed, onCloseFeedback }) {
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
