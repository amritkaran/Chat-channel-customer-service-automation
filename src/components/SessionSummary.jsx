import './SessionSummary.css'

function SessionSummary({ summary, onStartNewSession, onViewDetails, onLogout }) {
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatPercentage = (value) => {
    return value > 0 ? `↑${Math.round(value)}%` : `↓${Math.abs(Math.round(value))}%`
  }

  const totalHandleTime = summary.aiMetrics.avgHandleTime * summary.aiMetrics.count +
                          summary.manualMetrics.avgHandleTime * summary.manualMetrics.count

  const avgHandleTime = totalHandleTime / summary.totalContacts

  return (
    <div className="session-summary-overlay">
      <div className="session-summary-container">
        {/* Header */}
        <div className="summary-header">
          <h1 className="summary-title">🏆 Session Complete!</h1>
          <p className="summary-subtitle">You handled {summary.contactsHandled} contacts</p>
        </div>

        {/* Overall Performance */}
        <div className="summary-section">
          <h2 className="section-title">📈 Overall Performance</h2>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-value">{formatTime(totalHandleTime)}</div>
              <div className="stat-label">Total Session Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTime(avgHandleTime)}</div>
              <div className="stat-label">Avg Handle Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.contactsHandled}/{summary.totalContacts}</div>
              <div className="stat-label">Contacts Closed</div>
            </div>
          </div>
        </div>

        {/* AI vs Manual Comparison */}
        <div className="summary-section">
          <h2 className="section-title">⚔️ AI vs Manual Comparison</h2>
          <div className="comparison-grid">
            {/* AI Column */}
            <div className="comparison-column ai">
              <div className="column-header">
                <span className="column-icon">✨</span>
                <span className="column-title">AI Enabled</span>
                <span className="column-subtitle">Contacts 1-5</span>
              </div>

              <div className="metric-row">
                <div className="metric-label">Handle Time</div>
                <div className="metric-value">{formatTime(summary.aiMetrics.avgHandleTime)}</div>
                <div className={`metric-badge ${summary.comparison.handleTimeReduction > 0 ? 'better' : 'worse'}`}>
                  {summary.comparison.handleTimeReduction > 0 ? `↓${Math.round(summary.comparison.handleTimeReduction)}%` : `↑${Math.abs(Math.round(summary.comparison.handleTimeReduction))}%`}
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Auto-Close Rate</div>
                <div className="metric-value">{Math.round(summary.aiMetrics.autoCloseRate)}%</div>
                <div className="metric-badge better">Automated</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Msgs/Contact</div>
                <div className="metric-value">{Math.round(summary.aiMetrics.avgMessagesPerContact)}</div>
                <div className="metric-badge better">
                  -{Math.round(summary.comparison.messageReduction)}
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Detection Accuracy</div>
                <div className="metric-value">{Math.round(summary.aiMetrics.closureDetectionRate)}%</div>
                <div className="metric-badge better">AI Powered</div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="vs-divider">
              <span className="vs-text">VS</span>
            </div>

            {/* Manual Column */}
            <div className="comparison-column manual">
              <div className="column-header">
                <span className="column-icon">👤</span>
                <span className="column-title">Manual</span>
                <span className="column-subtitle">Contacts 6-10</span>
              </div>

              <div className="metric-row">
                <div className="metric-label">Handle Time</div>
                <div className="metric-value">{formatTime(summary.manualMetrics.avgHandleTime)}</div>
                <div className={`metric-badge ${summary.comparison.handleTimeReduction > 0 ? 'worse' : 'better'}`}>
                  {summary.comparison.handleTimeReduction > 0 ? `↑${Math.round(summary.comparison.handleTimeReduction)}%` : `↓${Math.abs(Math.round(summary.comparison.handleTimeReduction))}%`}
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Close Method</div>
                <div className="metric-value">100%</div>
                <div className="metric-badge worse">Manual Only</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Msgs/Contact</div>
                <div className="metric-value">{Math.round(summary.manualMetrics.avgMessagesPerContact)}</div>
                <div className="metric-badge worse">
                  +{Math.round(summary.comparison.messageReduction)}
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Detection</div>
                <div className="metric-value">N/A</div>
                <div className="metric-badge neutral">No AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="summary-section">
          <h2 className="section-title">💡 Key Insights</h2>
          <div className="insights-list">
            {summary.comparison.timeSavedPerContact > 0 ? (
              <>
                <div className="insight-item">
                  <span className="insight-icon">⚡</span>
                  <span className="insight-text">
                    AI reduced handle time by <strong>{formatTime(summary.comparison.timeSavedPerContact)}</strong> per contact
                  </span>
                </div>
                <div className="insight-item">
                  <span className="insight-icon">💰</span>
                  <span className="insight-text">
                    Total time saved: <strong>{formatTime(summary.comparison.totalTimeSaved)}</strong> across 5 AI contacts
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="insight-item">
                  <span className="insight-icon">📊</span>
                  <span className="insight-text">
                    Manual handling was <strong>{formatTime(Math.abs(summary.comparison.timeSavedPerContact))}</strong> faster per contact
                  </span>
                </div>
                <div className="insight-item">
                  <span className="insight-icon">💡</span>
                  <span className="insight-text">
                    AI can improve with better closure detection and faster response times
                  </span>
                </div>
              </>
            )}
            <div className="insight-item">
              <span className="insight-icon">🎯</span>
              <span className="insight-text">
                <strong>{Math.round(summary.aiMetrics.closureDetectionRate)}%</strong> closure detection accuracy
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🤖</span>
              <span className="insight-text">
                <strong>{Math.round(summary.aiMetrics.autoCloseRate)}%</strong> of AI contacts auto-closed successfully
              </span>
            </div>
          </div>
        </div>

        {/* Performance Rating */}
        <div className="summary-section">
          <h2 className="section-title">🎯 Your Performance</h2>
          <div className="performance-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`star ${i < Math.floor(summary.aiMetrics.closureDetectionRate / 20) ? 'filled' : ''}`}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="rating-text">
              {summary.aiMetrics.closureDetectionRate >= 90 ? 'Outstanding!' :
               summary.aiMetrics.closureDetectionRate >= 80 ? 'Great Job!' :
               summary.aiMetrics.closureDetectionRate >= 70 ? 'Good Work!' : 'Keep Practicing!'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="summary-actions">
          <button className="action-btn primary" onClick={onStartNewSession}>
            🔄 Start New Session
          </button>
          <button className="action-btn secondary" onClick={onViewDetails}>
            📊 View Detailed Report
          </button>
          <button className="action-btn tertiary" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionSummary
