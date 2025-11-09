-- Vercel Postgres Schema for Customer Service Metrics Tracking

-- Table: contact_sessions
-- Tracks each customer contact session
CREATE TABLE IF NOT EXISTS contact_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,

  -- Timestamps
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP,
  ended_at TIMESTAMP,

  -- Contact metrics
  handle_time_seconds INTEGER,
  message_count INTEGER DEFAULT 0,
  agent_message_count INTEGER DEFAULT 0,
  customer_message_count INTEGER DEFAULT 0,

  -- Closure tracking
  closure_detected BOOLEAN DEFAULT FALSE,
  closure_detected_at TIMESTAMP,
  time_to_closure_seconds INTEGER, -- Time from last_message_at to ended_at

  -- Auto-closure
  was_auto_closed BOOLEAN DEFAULT FALSE,
  auto_close_trigger VARCHAR(50), -- 'satisfied', 'timer_expired', 'manual'

  -- Feedback
  closure_feedback VARCHAR(20), -- 'correct', 'incorrect', NULL if not provided

  -- Session metadata
  user_session_id VARCHAR(100), -- Browser fingerprint or session ID
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: ai_events
-- Tracks individual AI decisions and detections
CREATE TABLE IF NOT EXISTS ai_events (
  id SERIAL PRIMARY KEY,
  contact_session_id INTEGER REFERENCES contact_sessions(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'closure_detection', 'classification', 'timer_started', 'timer_cancelled'
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- AI decision details (JSON)
  details JSONB,

  -- Classification specific
  classification_result VARCHAR(50), -- 'satisfied', 'needs_help', 'uncertain'

  -- Closure detection specific
  similarity_score DECIMAL(5,3),
  threshold_passed BOOLEAN,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: daily_metrics
-- Aggregated daily metrics for fast dashboard queries
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE UNIQUE NOT NULL,

  -- Contact volume
  total_contacts INTEGER DEFAULT 0,
  contacts_accepted INTEGER DEFAULT 0,
  contacts_declined INTEGER DEFAULT 0,

  -- Performance metrics
  avg_handle_time_seconds DECIMAL(10,2),
  avg_time_to_closure_seconds DECIMAL(10,2),
  avg_messages_per_contact DECIMAL(5,2),

  -- AI metrics
  total_closures_detected INTEGER DEFAULT 0,
  auto_closures_executed INTEGER DEFAULT 0,
  closure_feedback_correct INTEGER DEFAULT 0,
  closure_feedback_incorrect INTEGER DEFAULT 0,

  -- Classification metrics
  classifications_satisfied INTEGER DEFAULT 0,
  classifications_needs_help INTEGER DEFAULT 0,
  classifications_uncertain INTEGER DEFAULT 0,

  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: user_sessions
-- Track unique visitors/users
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,

  -- Session tracking
  first_visit TIMESTAMP DEFAULT NOW(),
  last_visit TIMESTAMP DEFAULT NOW(),
  visit_count INTEGER DEFAULT 1,

  -- Contact stats
  total_contacts_handled INTEGER DEFAULT 0,

  -- Browser/device info (optional)
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_sessions_started_at ON contact_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_contact_sessions_user_session ON contact_sessions(user_session_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_contact_session ON ai_events(contact_session_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_type ON ai_events(event_type);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(metric_date);

-- Views for common queries

-- View: Recent contacts summary
CREATE OR REPLACE VIEW v_recent_contacts AS
SELECT
  cs.session_id,
  cs.customer_name,
  cs.started_at,
  cs.ended_at,
  cs.handle_time_seconds,
  cs.message_count,
  cs.closure_detected,
  cs.was_auto_closed,
  cs.closure_feedback,
  COUNT(ae.id) as ai_events_count
FROM contact_sessions cs
LEFT JOIN ai_events ae ON cs.id = ae.contact_session_id
GROUP BY cs.id
ORDER BY cs.started_at DESC
LIMIT 100;

-- View: AI accuracy metrics
CREATE OR REPLACE VIEW v_ai_accuracy AS
SELECT
  COUNT(*) FILTER (WHERE closure_feedback = 'correct') as correct_closures,
  COUNT(*) FILTER (WHERE closure_feedback = 'incorrect') as incorrect_closures,
  ROUND(
    COUNT(*) FILTER (WHERE closure_feedback = 'correct')::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE closure_feedback IS NOT NULL), 0) * 100,
    2
  ) as accuracy_percentage
FROM contact_sessions
WHERE was_auto_closed = TRUE;

-- View: Overall statistics
CREATE OR REPLACE VIEW v_overall_stats AS
SELECT
  COUNT(*) as total_contacts,
  ROUND(AVG(time_to_closure_seconds), 2) as avg_time_to_closure_seconds,
  ROUND(AVG(time_to_closure_seconds) FILTER (WHERE was_auto_closed = TRUE), 2) as avg_time_to_closure_auto,
  ROUND(AVG(time_to_closure_seconds) FILTER (WHERE was_auto_closed = FALSE), 2) as avg_time_to_closure_manual,
  COUNT(*) FILTER (WHERE closure_detected = TRUE) as closures_detected,
  COUNT(*) FILTER (WHERE was_auto_closed = TRUE) as auto_closures,
  COUNT(*) FILTER (WHERE was_auto_closed = FALSE AND ended_at IS NOT NULL) as manual_closures,
  ROUND(
    COUNT(*) FILTER (WHERE was_auto_closed = TRUE)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE ended_at IS NOT NULL), 0) * 100,
    2
  ) as auto_closure_rate_percentage,
  ROUND(
    AVG(time_to_closure_seconds) FILTER (WHERE was_auto_closed = FALSE) -
    AVG(time_to_closure_seconds) FILTER (WHERE was_auto_closed = TRUE),
    2
  ) as time_saved_by_auto_closure_seconds
FROM contact_sessions
WHERE ended_at IS NOT NULL;
