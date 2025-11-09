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
      eventType,
      details,
      classificationResult,
      similarityScore,
      thresholdPassed
    } = req.body

    if (!sessionId || !eventType) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, eventType' })
    }

    // Get contact_session_id from session_id
    const contactResult = await sql`
      SELECT id FROM contact_sessions WHERE session_id = ${sessionId}
    `

    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact session not found' })
    }

    const contactSessionId = contactResult.rows[0].id

    // Insert AI event
    const result = await sql`
      INSERT INTO ai_events (
        contact_session_id,
        event_type,
        details,
        classification_result,
        similarity_score,
        threshold_passed,
        timestamp
      ) VALUES (
        ${contactSessionId},
        ${eventType},
        ${details ? JSON.stringify(details) : null},
        ${classificationResult || null},
        ${similarityScore || null},
        ${thresholdPassed || null},
        NOW()
      )
      RETURNING id, event_type, timestamp
    `

    // Update daily metrics for classification events
    if (eventType === 'classification' && classificationResult) {
      await updateClassificationMetrics(classificationResult)
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error saving AI event:', error)
    return res.status(500).json({
      error: 'Failed to save AI event',
      message: error.message
    })
  }
}

async function updateClassificationMetrics(classification) {
  const today = new Date().toISOString().split('T')[0]

  const field = classification === 'satisfied'
    ? 'classifications_satisfied'
    : classification === 'needs_help'
    ? 'classifications_needs_help'
    : 'classifications_uncertain'

  await sql`
    INSERT INTO daily_metrics (
      metric_date,
      ${sql(field)}
    ) VALUES (
      ${today},
      1
    )
    ON CONFLICT (metric_date)
    DO UPDATE SET
      ${sql(field)} = daily_metrics.${sql(field)} + 1,
      updated_at = NOW()
  `
}
