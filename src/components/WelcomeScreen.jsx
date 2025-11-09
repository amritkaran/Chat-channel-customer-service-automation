import { useState } from 'react'
import './WelcomeScreen.css'
import { audioService } from '../utils/audioService'
import Hint from './Hint'

function WelcomeScreen({ onStartTakingContacts }) {
  const [showGuide, setShowGuide] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showStartHint, setShowStartHint] = useState(true)

  const handleStart = () => {
    // Initialize audio on user interaction
    audioService.init()
    onStartTakingContacts()
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="brand-logo">
            <div className="logo-icon">🤖</div>
            <span className="brand-name">AI Customer Service Assistant</span>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            Portfolio Demo
          </div>
        </div>

        <div className="welcome-main">
          <div className="hero-section">
            <div className="hero-badge">
              <span className="badge-icon">🎓</span>
              AI Portfolio Project
            </div>
            <h1 className="hero-title">
              AI-Powered Customer Service
              <span className="gradient-text"> Simulator</span>
            </h1>
            <p className="hero-subtitle">
              Experience how AI automatically detects when customer issues are resolved—reducing handle time without sacrificing service quality.
            </p>

            <div className="cta-buttons">
              <div style={{ position: 'relative' }}>
                <button className="cta-button primary" onClick={handleStart}>
                  <span className="button-icon">🚀</span>
                  <span className="button-text">Try Interactive Demo</span>
                </button>
                {showStartHint && (
                  <Hint
                    message="Click to start! You'll handle customer chats and see AI-powered auto-closure in action."
                    position="bottom"
                    storageKey="welcome_start_hint"
                    showDelay={3000}
                    autoHide={false}
                  />
                )}
              </div>
              <button className="cta-link" onClick={() => setShowGuide(true)}>
                📖 Read the guide first →
              </button>
            </div>

            <div className="preview-section">
              <h3 className="preview-title">See It In Action</h3>
              <div className="preview-container">
                <div className="preview-placeholder">
                  <div className="preview-icon">🎬</div>
                  <p className="preview-text">Interactive demo shows real-time AI closure detection</p>
                  <div className="preview-features">
                    <span className="preview-tag">💬 Multi-chat Interface</span>
                    <span className="preview-tag">⏱️ Smart Timers</span>
                    <span className="preview-tag">💡 AI Inspector</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="problem-statement">
              <h3 className="problem-title">The Problem</h3>
              <p className="problem-text">
                In customer service call centers, agents often handle <strong>3+ simultaneous chat conversations</strong>.
                After solving a customer's issue, agents should immediately close the conversation—but
                <strong> multitasking causes them to forget</strong>. This leaves conversations open unnecessarily,
                inflating key performance metrics like <strong>Average Handle Time</strong> and reducing overall efficiency.
              </p>

              <h3 className="solution-title">The Solution</h3>
              <p className="solution-text">
                This AI system uses <strong>semantic embeddings</strong> (OpenAI's text-embedding-3-small) to detect when agents
                send closure statements, and <strong>LLM classification</strong> (GPT-4o-mini) to analyze customer intent.
                It automatically triggers smart closure timers—<strong>15 seconds for satisfied customers</strong>, 60 seconds
                for uncertain responses, and <strong>auto-cancels if customers need more help</strong>.
              </p>
            </div>

            <div className="portfolio-highlight">
              <div className="portfolio-header">
                <span className="portfolio-icon">📁</span>
                <h3>What I Built</h3>
              </div>
              <p className="portfolio-description">
                A full-stack AI-powered demo showcasing real-time semantic analysis, intelligent automation, and transparent AI decision-making in a simulated customer service environment.
              </p>
              <div className="tech-stack-grid">
                <div className="tech-stack-item">
                  <span className="tech-icon">⚛️</span>
                  <span className="tech-name">React</span>
                  <span className="tech-detail">Hooks & State Management</span>
                </div>
                <div className="tech-stack-item">
                  <span className="tech-icon">🤖</span>
                  <span className="tech-name">OpenAI API</span>
                  <span className="tech-detail">Embeddings + GPT-4o-mini</span>
                </div>
                <div className="tech-stack-item">
                  <span className="tech-icon">🧮</span>
                  <span className="tech-name">Cosine Similarity</span>
                  <span className="tech-detail">Vector-based Matching</span>
                </div>
                <div className="tech-stack-item">
                  <span className="tech-icon">⚡</span>
                  <span className="tech-name">Real-time Logic</span>
                  <span className="tech-detail">Adaptive Timers & Classification</span>
                </div>
              </div>
              <div className="portfolio-links">
                <a href="https://github.com/yourusername/project" target="_blank" rel="noopener noreferrer" className="portfolio-link">
                  <span>View on GitHub</span>
                  <span className="link-arrow">→</span>
                </a>
              </div>
            </div>
          </div>

          <div className="ai-features-section">
            <h2 className="section-title">AI-Powered Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon gradient-bg-purple">🎯</div>
                <h3>Smart Closure Detection</h3>
                <p>Uses OpenAI embeddings to detect closure statements with 65% similarity threshold</p>
                <div className="tech-badge">text-embedding-3-small</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon gradient-bg-blue">🤖</div>
                <h3>Response Classification</h3>
                <p>LLM analyzes customer intent: satisfied, needs_help, or uncertain</p>
                <div className="tech-badge">gpt-4o-mini</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon gradient-bg-orange">⏱️</div>
                <h3>Adaptive Timers</h3>
                <p>60s standard or 15s fast-close when customer is satisfied. Auto-cancels if more help needed</p>
                <div className="tech-badge">Dynamic Logic</div>
              </div>
              <div className="feature-card">
                <div className="feature-icon gradient-bg-yellow">💡</div>
                <h3>Transparent AI</h3>
                <p>Inspector mode shows similarity scores, classification reasoning, and decision-making process</p>
                <div className="tech-badge">Educational</div>
              </div>
            </div>
          </div>

          <div className="how-it-works-section">
            <h2 className="section-title">How to Test</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Accept Contacts</h4>
                <p>Handle up to 3 parallel customer chats simultaneously</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Provide Resolution</h4>
                <p>Type closure statements like "Is there anything else I can help you with?"</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Watch AI Work</h4>
                <p>Observe auto-closure timer, classification, and adaptive behavior</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h4>Use AI Inspector</h4>
                <p>Click 🔦 AI Inspector to see similarity scores and LLM reasoning</p>
              </div>
            </div>
          </div>

          <div className="bottom-cta-section">
            <h2 className="bottom-cta-title">Ready to See It In Action?</h2>
            <p className="bottom-cta-subtitle">
              Experience how AI can intelligently detect customer satisfaction and automate closures
            </p>
            <button className="cta-button primary large" onClick={handleStart}>
              <span className="button-icon">🚀</span>
              <span className="button-text">Start Interactive Demo</span>
            </button>
          </div>
        </div>

        <div className="welcome-footer">
          <div className="footer-content">
            <p className="footer-tech">
              Built with <strong>React</strong>, <strong>OpenAI API</strong> (GPT-4o-mini, text-embedding-3-small), and modern design patterns
            </p>
            <div className="footer-links">
              <a href="https://github.com/yourusername/project" target="_blank" rel="noopener noreferrer" className="footer-link">
                GitHub
              </a>
              <span className="footer-divider">·</span>
              <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="footer-link">
                LinkedIn
              </a>
              <span className="footer-divider">·</span>
              <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                Portfolio
              </a>
            </div>
            <p className="footer-copyright">© 2025 Your Name · AI Portfolio Project</p>
          </div>
        </div>
      </div>

      {/* Interactive Guide Modal */}
      {showGuide && (
        <div className="guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="guide-close" onClick={() => setShowGuide(false)}>✕</button>

            <h2 className="guide-title">Interactive Guide</h2>

            <div className="guide-tabs">
              <button
                className={`guide-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📋 Overview
              </button>
              <button
                className={`guide-tab ${activeTab === 'how-to-use' ? 'active' : ''}`}
                onClick={() => setActiveTab('how-to-use')}
              >
                🚀 How to Use
              </button>
              <button
                className={`guide-tab ${activeTab === 'testing' ? 'active' : ''}`}
                onClick={() => setActiveTab('testing')}
              >
                ✓ Testing Guide
              </button>
              <button
                className={`guide-tab ${activeTab === 'ai-inspector' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-inspector')}
              >
                💡 AI Inspector
              </button>
            </div>

            <div className="guide-content">
              {activeTab === 'overview' && (
                <div className="guide-section">
                  <h3>What This Project Does</h3>
                  <p>
                    This project <strong>simulates a customer service associate (CSA) environment</strong> where agents handle <strong>up to 3 concurrent chat conversations</strong>. The simulation demonstrates how AI-powered auto-closure detection can reduce <strong>Average Handle Time (AHT)</strong> and <strong>Time to Closure</strong> metrics.
                  </p>

                  <h3>The Business Problem</h3>
                  <p>
                    CSAs are required to close contacts immediately after providing resolution. However, when juggling multiple conversations simultaneously, <strong>multitasking causes distraction</strong>. Agents forget to close resolved contacts promptly, leading to:
                  </p>
                  <ul>
                    <li><strong>Increased Time to Closure:</strong> The gap between the last message and actual contact closure grows unnecessarily</li>
                    <li><strong>Higher Handle Time:</strong> Delayed closures inflate overall contact duration metrics</li>
                    <li><strong>Reduced Efficiency:</strong> Manual closure management takes focus away from helping customers</li>
                  </ul>

                  <h3>AI Components</h3>
                  <div className="tech-stack">
                    <div className="tech-item">
                      <span className="tech-emoji">🎯</span>
                      <div>
                        <strong>Embedding-Based Similarity</strong>
                        <p>Uses OpenAI's <code>text-embedding-3-small</code> to convert messages into vectors and calculate cosine similarity. When an agent's message is ≥65% similar to closure phrases, auto-closure is triggered.</p>
                      </div>
                    </div>
                    <div className="tech-item">
                      <span className="tech-emoji">🤖</span>
                      <div>
                        <strong>LLM Intent Classification</strong>
                        <p>Uses <code>gpt-4o-mini</code> to analyze customer responses and classify intent: <code>satisfied</code>, <code>needs_help</code>, or <code>uncertain</code>. Adapts timer and behavior based on classification.</p>
                      </div>
                    </div>
                    <div className="tech-item">
                      <span className="tech-emoji">⏱️</span>
                      <div>
                        <strong>Adaptive Timers</strong>
                        <p>Standard 60-second countdown for normal interactions. Fast-close 15-second countdown when customer is satisfied. Automatically cancels if customer needs more help.</p>
                      </div>
                    </div>
                  </div>

                  <h3>Business Impact</h3>
                  <ul>
                    <li><strong>Reduces Time to Closure:</strong> Automatically triggers closure when resolution is provided, eliminating delay caused by multitasking</li>
                    <li><strong>Decreases Average Handle Time:</strong> Faster closures directly reduce overall contact duration metrics</li>
                    <li><strong>Improves Agent Efficiency:</strong> Removes manual closure overhead, letting agents focus on customer problem-solving</li>
                    <li><strong>Maintains Quality:</strong> Intelligent classification ensures contacts close only when customers are satisfied</li>
                    <li><strong>Provides Transparency:</strong> AI Inspector shows decision-making process for auditability and trust</li>
                  </ul>
                </div>
              )}

              {activeTab === 'how-to-use' && (
                <div className="guide-section">
                  <h3>Customer Service Agent Workflow</h3>

                  <div className="workflow-step">
                    <div className="workflow-number">1</div>
                    <div className="workflow-content">
                      <h4>Accept Incoming Contacts</h4>
                      <p>Click "Accept" when you see the incoming contact banner. You can handle up to 3 parallel chats simultaneously, just like a real contact center environment.</p>
                    </div>
                  </div>

                  <div className="workflow-step">
                    <div className="workflow-number">2</div>
                    <div className="workflow-content">
                      <h4>Acknowledge Customer Issue</h4>
                      <p>Read the customer's problem and send an acknowledgment message. Example: "I understand you're having trouble with your order. Let me help you with that."</p>
                    </div>
                  </div>

                  <div className="workflow-step">
                    <div className="workflow-number">3</div>
                    <div className="workflow-content">
                      <h4>Provide Resolution</h4>
                      <p>Address the customer's issue with appropriate solutions and information. Take your time to provide quality assistance.</p>
                    </div>
                  </div>

                  <div className="workflow-step">
                    <div className="workflow-number">4</div>
                    <div className="workflow-content">
                      <h4>Send Closure Statement</h4>
                      <p>When ready to close, use phrases like:</p>
                      <ul>
                        <li>"Is there anything else I can help you with?"</li>
                        <li>"Can I assist you with anything else today?"</li>
                        <li>"Do you have any other questions?"</li>
                      </ul>
                      <p className="tip">💡 The AI will detect these closure statements automatically!</p>
                    </div>
                  </div>

                  <div className="workflow-step">
                    <div className="workflow-number">5</div>
                    <div className="workflow-content">
                      <h4>Watch AI Auto-Closure</h4>
                      <p>Observe the countdown timer appear. The AI will classify the customer's response and adjust behavior accordingly. You can revert the timer if needed.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'testing' && (
                <div className="guide-section">
                  <h3>What to Test</h3>

                  <div className="test-scenario">
                    <h4>✅ Scenario 1: Successful Auto-Closure</h4>
                    <ol>
                      <li>Send a closure statement: "Is there anything else I can help you with?"</li>
                      <li>Customer responds: "No, that's all. Thank you!"</li>
                      <li><strong>Expected:</strong> Fast-close timer (15s) appears, contact closes automatically</li>
                    </ol>
                  </div>

                  <div className="test-scenario">
                    <h4>⏱️ Scenario 2: Standard Closure</h4>
                    <ol>
                      <li>Send closure statement</li>
                      <li>Customer responds: "I think that's it"</li>
                      <li><strong>Expected:</strong> Standard timer (60s) appears for uncertain response</li>
                    </ol>
                  </div>

                  <div className="test-scenario">
                    <h4>🔄 Scenario 3: Auto-Revert</h4>
                    <ol>
                      <li>Send closure statement, timer starts</li>
                      <li>Customer responds: "Actually, I have one more question..."</li>
                      <li><strong>Expected:</strong> Timer automatically cancels, contact remains open</li>
                    </ol>
                  </div>

                  <div className="test-scenario">
                    <h4>🔧 Scenario 4: Manual Revert</h4>
                    <ol>
                      <li>Send closure statement, timer starts</li>
                      <li>Click "Revert" button before timer expires</li>
                      <li><strong>Expected:</strong> Timer cancels, contact stays open</li>
                    </ol>
                  </div>

                  <h3>Verification Checklist</h3>
                  <ul>
                    <li>✓ Closure detection triggers on appropriate statements</li>
                    <li>✓ Fast-close (15s) activates for satisfied customers</li>
                    <li>✓ Standard timer (60s) for uncertain responses</li>
                    <li>✓ Auto-revert works when customer needs more help</li>
                    <li>✓ Manual revert button functions correctly</li>
                    <li>✓ AI Inspector shows similarity scores and reasoning</li>
                  </ul>
                </div>
              )}

              {activeTab === 'ai-inspector' && (
                <div className="guide-section">
                  <h3>How to Use AI Inspector</h3>

                  <div className="inspector-feature">
                    <h4>💡 Enabling Inspector Mode</h4>
                    <p>Click the <strong>🔦 AI Inspector</strong> button in the chat header to turn on AI Inspector. The button will transform to a glowing yellow bulb 💡 when active.</p>
                  </div>

                  <div className="inspector-feature">
                    <h4>🏷️ AI Decision Badges</h4>
                    <p>When AI Inspector is ON, you'll see colored badges next to messages where AI made decisions:</p>
                    <ul>
                      <li><span className="badge-example closure">Closure Detection</span> - Purple badge when closure is detected</li>
                      <li><span className="badge-example satisfied">Satisfied</span> - Green badge for satisfied customer</li>
                      <li><span className="badge-example needs-help">Needs Help</span> - Red badge when customer needs assistance</li>
                      <li><span className="badge-example uncertain">Uncertain</span> - Orange badge for uncertain responses</li>
                    </ul>
                  </div>

                  <div className="inspector-feature">
                    <h4>🔍 Detailed AI Analysis</h4>
                    <p>Click any AI badge to open a detailed popup showing:</p>
                    <ul>
                      <li><strong>Similarity Score:</strong> Cosine similarity percentage (0-100%)</li>
                      <li><strong>Threshold:</strong> The 65% threshold for closure detection</li>
                      <li><strong>Classification:</strong> Customer intent classification result</li>
                      <li><strong>LLM Reasoning:</strong> Natural language explanation of why the AI made this decision</li>
                      <li><strong>Timer Decision:</strong> Whether fast-close or standard timer was triggered</li>
                    </ul>
                  </div>

                  <div className="inspector-feature">
                    <h4>📊 Understanding Similarity Scores</h4>
                    <ul>
                      <li><strong>65-100%:</strong> High confidence closure detection</li>
                      <li><strong>50-64%:</strong> Below threshold, no auto-closure triggered</li>
                      <li><strong>0-49%:</strong> Not a closure statement</li>
                    </ul>
                  </div>

                  <div className="inspector-feature">
                    <h4>🎓 Educational Value</h4>
                    <p>Use AI Inspector to:</p>
                    <ul>
                      <li>Understand how embeddings capture semantic meaning</li>
                      <li>See how LLMs classify customer intent</li>
                      <li>Learn about threshold-based decision making</li>
                      <li>Analyze edge cases and model behavior</li>
                      <li>Build intuition for AI-powered automation</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WelcomeScreen
