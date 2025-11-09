import './AIDetailPopup.css'

function AIDetailPopup({ type, data, onClose }) {
  if (!data) return null

  const renderClosureDetails = () => (
    <div className="detail-content">
      <div className="detail-header">
        <span className="detail-icon">🎯</span>
        <h3>Closure Detection</h3>
      </div>

      <div className="detail-section">
        <label>Agent Message</label>
        <div className="message-preview">"{data.message}"</div>
      </div>

      <div className="detail-section">
        <label>Embedding Similarity Matches</label>
        <div className="similarity-grid">
          {data.top3Matches?.map((match, idx) => (
            <div key={idx} className="similarity-card">
              <div className="similarity-rank">#{idx + 1}</div>
              <div className="similarity-score">
                <span className="score-value">{match.score.toFixed(3)}</span>
                <span className="score-label">similarity</span>
              </div>
              <div className="similarity-text">"{match.example}"</div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <label>Threshold Check</label>
        <div className="threshold-bar">
          <div className="threshold-labels">
            <span>Score: <strong>{data.maxSimilarity?.toFixed(3)}</strong></span>
            <span>Threshold: <strong>{data.threshold}</strong></span>
          </div>
          <div className="threshold-visual">
            <div
              className="threshold-fill"
              style={{ width: `${Math.min((data.maxSimilarity / 1) * 100, 100)}%` }}
            ></div>
            <div
              className="threshold-line"
              style={{ left: `${(data.threshold / 1) * 100}%` }}
            ></div>
          </div>
          <div className={`threshold-result ${data.passed ? 'passed' : 'failed'}`}>
            {data.passed ? '✅ Closure Detected' : '❌ Not a Closure'}
          </div>
        </div>
      </div>

      <div className="learning-section">
        <div className="learning-icon">💡</div>
        <div className="learning-content">
          <strong>How it works:</strong> Embeddings measure semantic similarity between messages,
          not exact word matching. This allows the system to recognize closure statements even when
          phrased differently.
        </div>
      </div>
    </div>
  )

  const renderClassificationDetails = () => (
    <div className="detail-content">
      <div className="detail-header">
        <span className="detail-icon">🤖</span>
        <h3>LLM Classification</h3>
      </div>

      <div className="detail-section">
        <label>Customer Message</label>
        <div className="message-preview">"{data.customerMessage}"</div>
      </div>

      <div className="detail-section">
        <label>AI Analysis</label>
        <div className="analysis-card">
          <div className="analysis-row">
            <span className="analysis-label">Model</span>
            <span className="analysis-value">{data.model}</span>
          </div>
          <div className="analysis-row">
            <span className="analysis-label">Classification</span>
            <span className={`classification-pill ${data.classification}`}>
              {data.classification === 'satisfied' && '✅ Satisfied'}
              {data.classification === 'needs_help' && '❓ Needs Help'}
              {data.classification === 'uncertain' && '⚠️ Uncertain'}
            </span>
          </div>
          <div className="analysis-row">
            <span className="analysis-label">Context Used</span>
            <span className="analysis-value">{data.conversationContext} messages</span>
          </div>
        </div>
      </div>

      {data.llmResponse && (
        <div className="detail-section">
          <label>LLM Raw Response</label>
          <div className="message-preview">{data.llmResponse}</div>
        </div>
      )}

      {data.systemPrompt && (
        <div className="detail-section">
          <label>System Instructions</label>
          <div className="prompt-preview">{data.systemPrompt}</div>
        </div>
      )}

      {data.userPrompt && (
        <div className="detail-section">
          <label>Analysis Prompt</label>
          <div className="prompt-preview">{data.userPrompt}</div>
        </div>
      )}

      {data.action && (
        <div className="detail-section">
          <label>Action Taken</label>
          <div className="action-card">
            {data.action}
          </div>
        </div>
      )}

      <div className="learning-section">
        <div className="learning-icon">💡</div>
        <div className="learning-content">
          <strong>How it works:</strong> The LLM reads the entire conversation context and applies
          specific rules to classify customer intent (needs_help / satisfied / uncertain). Based on
          the classification, the system adjusts the auto-closure timer.
        </div>
      </div>
    </div>
  )

  return (
    <div className="ai-detail-overlay" onClick={onClose}>
      <div className="ai-detail-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <span>✕</span>
        </button>
        {type === 'closure' ? renderClosureDetails() : renderClassificationDetails()}
      </div>
    </div>
  )
}

export default AIDetailPopup
