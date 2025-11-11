import { useState, useEffect } from 'react'
import './MetricsDashboard.css'
import { fetchDashboardMetrics } from '../utils/metricsService'

function MetricsDashboard({ onClose }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    setError(null)

    const data = await fetchDashboardMetrics()

    if (data) {
      setMetrics(data)
    } else {
      setError('Failed to load metrics. Make sure Vercel Postgres is configured.')
    }

    setLoading(false)
  }

  const formatSeconds = (seconds) => {
    if (!seconds && seconds !== 0) return '-'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatPercentage = (value) => {
    if (!value && value !== 0) return '-'
    return `${value}%`
  }

  if (loading) {
    return (
      <div className="metrics-dashboard">
        <div className="metrics-loading">
          <div className="loading-spinner"></div>
          <p>Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="metrics-dashboard">
        <div className="metrics-error">
          <span className="error-icon">⚠️</span>
          <h2>Unable to Load Metrics</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadMetrics}>Retry</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  const overall = metrics?.overall || {}
  const aiAccuracy = metrics?.aiAccuracy || {}
  const classificationBreakdown = metrics?.classificationBreakdown || []
  const dailyMetrics = metrics?.dailyMetrics || []

  // Calculate classification totals
  const satisfiedCount = classificationBreakdown.find(c => c.classification_result === 'satisfied')?.count || 0
  const needsHelpCount = classificationBreakdown.find(c => c.classification_result === 'needs_help')?.count || 0
  const uncertainCount = classificationBreakdown.find(c => c.classification_result === 'uncertain')?.count || 0
  const totalClassifications = satisfiedCount + needsHelpCount + uncertainCount

  // Calculate ML Performance Metrics
  const TP = aiAccuracy.correct_closures || 0  // True Positives (from real feedback)
  const FP = aiAccuracy.incorrect_closures || 0  // False Positives (from real feedback)

  // Real-time metric (from actual CSA feedback)
  const precision = (TP + FP) > 0 ? (TP / (TP + FP) * 100) : 0

  // Static benchmark values from controlled AI testing
  const benchmarkRecall = 85.0  // From your past AI tests
  const benchmarkF1Score = 87.5  // From your past AI tests
  const benchmarkAccuracy = 88.0  // From your past AI tests

  return (
    <div className="metrics-dashboard">
      <div className="metrics-header">
        <div className="header-content">
          <h1 className="dashboard-title">📊 Metrics Dashboard</h1>
          <p className="dashboard-subtitle">Real-time analytics from all users</p>
        </div>
        <button className="close-dashboard-btn" onClick={onClose}>✕</button>
      </div>

      <div className="metrics-content">
        {/* Summary Cards */}
        <section className="metrics-section">
          <h2 className="section-title">Overview</h2>
          <div className="summary-cards">
            <div className="metric-card primary">
              <div className="card-icon">📞</div>
              <div className="card-content">
                <span className="card-label">Total Contacts</span>
                <span className="card-value">{overall.total_contacts || 0}</span>
              </div>
            </div>

            <div className="metric-card success">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <span className="card-label">Avg Time to Closure</span>
                <span className="card-value">{formatSeconds(overall.avg_time_to_closure_seconds)}</span>
              </div>
            </div>

            <div className="metric-card info">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <span className="card-label">AI Accuracy</span>
                <span className="card-value">{formatPercentage(aiAccuracy.accuracy_percentage)}</span>
                <span className="card-subtitle">
                  {aiAccuracy.correct_closures || 0} / {(aiAccuracy.correct_closures || 0) + (aiAccuracy.incorrect_closures || 0)} correct
                </span>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="card-icon">🤖</div>
              <div className="card-content">
                <span className="card-label">Auto-Closure Rate</span>
                <span className="card-value">{formatPercentage(overall.auto_closure_rate_percentage)}</span>
                <span className="card-subtitle">
                  {overall.auto_closures || 0} / {overall.total_contacts || 0} contacts
                </span>
              </div>
            </div>

            <div className="metric-card purple">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <span className="card-label">Unique Users</span>
                <span className="card-value">{metrics.uniqueUsers || 0}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Time to Closure Breakdown */}
        <section className="metrics-section">
          <h2 className="section-title">Time to Closure Analysis</h2>
          <div className="closure-breakdown">
            <div className="breakdown-card auto">
              <div className="breakdown-header">
                <span className="breakdown-icon">🤖</span>
                <h3>Auto-Closed Contacts</h3>
              </div>
              <div className="breakdown-stats">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{overall.auto_closures || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Time to Closure</span>
                  <span className="stat-value large">{formatSeconds(overall.avg_time_to_closure_auto)}</span>
                </div>
              </div>
            </div>

            <div className="breakdown-card manual">
              <div className="breakdown-header">
                <span className="breakdown-icon">👤</span>
                <h3>Manually Closed Contacts</h3>
              </div>
              <div className="breakdown-stats">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{overall.manual_closures || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Time to Closure</span>
                  <span className="stat-value large">{formatSeconds(overall.avg_time_to_closure_manual)}</span>
                </div>
              </div>
            </div>

            <div className="breakdown-card savings">
              <div className="breakdown-header">
                <span className="breakdown-icon">💰</span>
                <h3>Time Saved by AI</h3>
              </div>
              <div className="breakdown-stats">
                <div className="stat-item center">
                  <span className="stat-label">Average Time Saved</span>
                  <span className="stat-value highlight">
                    {formatSeconds(overall.time_saved_by_auto_closure_seconds)}
                  </span>
                  <span className="stat-subtitle">per auto-closed contact</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Performance */}
        <section className="metrics-section">
          <h2 className="section-title">Contact Performance</h2>
          <div className="performance-grid">
            <div className="performance-card">
              <span className="performance-icon">🎯</span>
              <span className="performance-label">Closures Detected</span>
              <span className="performance-value">{overall.closures_detected || 0}</span>
            </div>
            <div className="performance-card">
              <span className="performance-icon">🤖</span>
              <span className="performance-label">Auto-Closures</span>
              <span className="performance-value">{overall.auto_closures || 0}</span>
            </div>
            <div className="performance-card">
              <span className="performance-icon">👤</span>
              <span className="performance-label">Manual Closures</span>
              <span className="performance-value">{overall.manual_closures || 0}</span>
            </div>
          </div>
        </section>

        {/* AI Performance Breakdown */}
        <section className="metrics-section">
          <h2 className="section-title">AI Performance</h2>
          <div className="ai-performance">
            {/* Closure Feedback */}
            <div className="ai-card">
              <h3 className="ai-card-title">Closure Feedback</h3>
              <div className="feedback-stats">
                <div className="feedback-item correct">
                  <span className="feedback-icon">👍</span>
                  <div className="feedback-content">
                    <span className="feedback-label">Correct</span>
                    <span className="feedback-value">{aiAccuracy.correct_closures || 0}</span>
                  </div>
                </div>
                <div className="feedback-item incorrect">
                  <span className="feedback-icon">👎</span>
                  <div className="feedback-content">
                    <span className="feedback-label">Incorrect</span>
                    <span className="feedback-value">{aiAccuracy.incorrect_closures || 0}</span>
                  </div>
                </div>
                <div className="feedback-accuracy">
                  <span className="accuracy-label">Accuracy</span>
                  <span className="accuracy-value">{formatPercentage(aiAccuracy.accuracy_percentage)}</span>
                </div>
              </div>
            </div>

            {/* Classification Results */}
            <div className="ai-card">
              <h3 className="ai-card-title">Customer Classifications</h3>
              <div className="classification-stats">
                <div className="classification-item satisfied">
                  <div className="classification-header">
                    <span className="classification-icon">✅</span>
                    <span className="classification-label">Satisfied</span>
                  </div>
                  <span className="classification-value">{satisfiedCount}</span>
                  <span className="classification-subtitle">15s fast-close</span>
                </div>
                <div className="classification-item needs-help">
                  <div className="classification-header">
                    <span className="classification-icon">❓</span>
                    <span className="classification-label">Needs Help</span>
                  </div>
                  <span className="classification-value">{needsHelpCount}</span>
                  <span className="classification-subtitle">Auto-cancelled</span>
                </div>
                <div className="classification-item uncertain">
                  <div className="classification-header">
                    <span className="classification-icon">⚠️</span>
                    <span className="classification-label">Uncertain</span>
                  </div>
                  <span className="classification-value">{uncertainCount}</span>
                  <span className="classification-subtitle">60s standard</span>
                </div>
              </div>
              {totalClassifications > 0 && (
                <div className="classification-total">
                  Total Classifications: {totalClassifications}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ML Performance Metrics */}
        <section className="metrics-section">
          <h2 className="section-title">ML Performance Metrics</h2>
          <div className="ml-metrics-grid">
            <div className="ml-metric-card precision">
              <div className="ml-metric-header">
                <span className="ml-metric-icon">🔍</span>
                <span className="ml-metric-label">Precision</span>
                <span className="ml-metric-badge live">Live</span>
              </div>
              <div className="ml-metric-value">{precision.toFixed(2)}%</div>
              <div className="ml-metric-formula">TP / (TP + FP)</div>
              <div className="ml-metric-subtitle">{TP} correct / {TP + FP} total auto-closures</div>
            </div>

            <div className="ml-metric-card accuracy">
              <div className="ml-metric-header">
                <span className="ml-metric-icon">🎯</span>
                <span className="ml-metric-label">Accuracy</span>
                <span className="ml-metric-badge benchmark">Benchmark</span>
              </div>
              <div className="ml-metric-value">{benchmarkAccuracy.toFixed(2)}%</div>
              <div className="ml-metric-formula">(TP + TN) / Total</div>
              <div className="ml-metric-subtitle">From controlled testing</div>
            </div>

            <div className="ml-metric-card recall">
              <div className="ml-metric-header">
                <span className="ml-metric-icon">📊</span>
                <span className="ml-metric-label">Recall</span>
                <span className="ml-metric-badge benchmark">Benchmark</span>
              </div>
              <div className="ml-metric-value">{benchmarkRecall.toFixed(2)}%</div>
              <div className="ml-metric-formula">TP / (TP + FN)</div>
              <div className="ml-metric-subtitle">From controlled testing</div>
            </div>

            <div className="ml-metric-card f1">
              <div className="ml-metric-header">
                <span className="ml-metric-icon">⚖️</span>
                <span className="ml-metric-label">F1 Score</span>
                <span className="ml-metric-badge benchmark">Benchmark</span>
              </div>
              <div className="ml-metric-value">{benchmarkF1Score.toFixed(2)}%</div>
              <div className="ml-metric-formula">2 × (P × R) / (P + R)</div>
              <div className="ml-metric-subtitle">From controlled testing</div>
            </div>
          </div>

          <div className="feedback-summary">
            <h3 className="feedback-title">Real-Time Feedback Summary</h3>
            <div className="feedback-grid">
              <div className="feedback-stat correct">
                <span className="feedback-stat-icon">✅</span>
                <div className="feedback-stat-content">
                  <span className="feedback-stat-label">Correct Auto-Closures</span>
                  <span className="feedback-stat-value">{TP}</span>
                </div>
              </div>
              <div className="feedback-stat incorrect">
                <span className="feedback-stat-icon">❌</span>
                <div className="feedback-stat-content">
                  <span className="feedback-stat-label">Incorrect Auto-Closures</span>
                  <span className="feedback-stat-value">{FP}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Trends */}
        {dailyMetrics.length > 0 && (
          <section className="metrics-section">
            <h2 className="section-title">Daily Trends (Last 30 Days)</h2>
            <div className="trends-container">
              <div className="trend-chart">
                <h4 className="chart-title">Contact Volume</h4>
                <div className="chart-bars">
                  {dailyMetrics.slice(0, 14).reverse().map((day, idx) => {
                    const maxContacts = Math.max(...dailyMetrics.map(d => d.total_contacts))
                    const heightPercent = (day.total_contacts / maxContacts) * 100
                    return (
                      <div key={idx} className="bar-wrapper">
                        <div
                          className="bar"
                          style={{ height: `${heightPercent}%` }}
                          title={`${new Date(day.metric_date).toLocaleDateString()}: ${day.total_contacts} contacts`}
                        >
                          <span className="bar-value">{day.total_contacts}</span>
                        </div>
                        <span className="bar-label">
                          {new Date(day.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {overall.total_contacts === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <h3>No Data Yet</h3>
            <p>Start handling contacts to see metrics appear here.</p>
            <p className="empty-subtitle">All users' data will be aggregated in this dashboard.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricsDashboard
