import { sql } from '@vercel/postgres'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      sessionId,
      customerName,
      action, // 'start', 'update', 'end'
      messageCount,
      agentMessageCount,
      customerMessageCount,
      lastMessageAt,
      closureDetected,
      closureDetectedAt,
      timeToClosureSeconds,
      wasAutoClosed,
      autoCloseTrigger,
      closureFeedback,
      userSessionId
    } = req.body

    if (!sessionId || !action) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, action' })
    }

    let result

    if (action === 'start') {
      // Create new contact session
      result = await sql`
        INSERT INTO contact_sessions (
          session_id,
          customer_name,
          user_session_id,
          started_at
        ) VALUES (
          ${sessionId},
          ${customerName},
          ${userSessionId || null},
          NOW()
        )
        ON CONFLICT (session_id) DO NOTHING
        RETURNING id, session_id
      `
    } else if (action === 'update' || action === 'end') {
      // Update existing contact session
      const endedAt = action === 'end' ? new Date().toISOString() : null

      result = await sql`
        UPDATE contact_sessions
        SET
          message_count = COALESCE(${messageCount}, message_count),
          agent_message_count = COALESCE(${agentMessageCount}, agent_message_count),
          customer_message_count = COALESCE(${customerMessageCount}, customer_message_count),
          last_message_at = COALESCE(${lastMessageAt}, last_message_at),
          closure_detected = COALESCE(${closureDetected}, closure_detected),
          closure_detected_at = COALESCE(${closureDetectedAt}, closure_detected_at),
          was_auto_closed = COALESCE(${wasAutoClosed}, was_auto_closed),
          auto_close_trigger = COALESCE(${autoCloseTrigger}, auto_close_trigger),
          closure_feedback = COALESCE(${closureFeedback}, closure_feedback),
          ended_at = COALESCE(${endedAt}, ended_at),
          handle_time_seconds = CASE
            WHEN ${endedAt}::timestamp IS NOT NULL
            THEN EXTRACT(EPOCH FROM (${endedAt}::timestamp - started_at))::integer
            ELSE handle_time_seconds
          END,
          time_to_closure_seconds = CASE
            WHEN ${endedAt}::timestamp IS NOT NULL AND last_message_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (${endedAt}::timestamp - last_message_at))::integer
            ELSE time_to_closure_seconds
          END
        WHERE session_id = ${sessionId}
        RETURNING id, session_id
      `

      // Update daily metrics if ending
      if (action === 'end') {
        await updateDailyMetrics(closureDetected, wasAutoClosed, closureFeedback)
      }
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be: start, update, or end' })
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error saving contact metrics:', error)
    return res.status(500).json({
      error: 'Failed to save contact metrics',
      message: error.message
    })
  }
}

async function updateDailyMetrics(closureDetected, wasAutoClosed, closureFeedback) {
  const today = new Date().toISOString().split('T')[0]

  await sql`
    INSERT INTO daily_metrics (
      metric_date,
      total_contacts,
      total_closures_detected,
      auto_closures_executed,
      closure_feedback_correct,
      closure_feedback_incorrect
    ) VALUES (
      ${today},
      1,
      ${closureDetected ? 1 : 0},
      ${wasAutoClosed ? 1 : 0},
      ${closureFeedback === 'correct' ? 1 : 0},
      ${closureFeedback === 'incorrect' ? 1 : 0}
    )
    ON CONFLICT (metric_date)
    DO UPDATE SET
      total_contacts = daily_metrics.total_contacts + 1,
      total_closures_detected = daily_metrics.total_closures_detected + ${closureDetected ? 1 : 0},
      auto_closures_executed = daily_metrics.auto_closures_executed + ${wasAutoClosed ? 1 : 0},
      closure_feedback_correct = daily_metrics.closure_feedback_correct + ${closureFeedback === 'correct' ? 1 : 0},
      closure_feedback_incorrect = daily_metrics.closure_feedback_incorrect + ${closureFeedback === 'incorrect' ? 1 : 0},
      updated_at = NOW()
  `
}
