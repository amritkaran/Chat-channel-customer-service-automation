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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get overall statistics
    const overallStats = await sql`
      SELECT * FROM v_overall_stats
    `

    // Get AI accuracy
    const aiAccuracy = await sql`
      SELECT * FROM v_ai_accuracy
    `

    // Get recent contacts
    const recentContacts = await sql`
      SELECT * FROM v_recent_contacts LIMIT 20
    `

    // Get daily metrics for the last 30 days
    const dailyMetrics = await sql`
      SELECT
        metric_date,
        total_contacts,
        avg_handle_time_seconds,
        total_closures_detected,
        auto_closures_executed,
        closure_feedback_correct,
        closure_feedback_incorrect,
        classifications_satisfied,
        classifications_needs_help,
        classifications_uncertain
      FROM daily_metrics
      WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY metric_date DESC
    `

    // Get classification breakdown
    const classificationBreakdown = await sql`
      SELECT
        classification_result,
        COUNT(*) as count
      FROM ai_events
      WHERE event_type = 'classification'
        AND classification_result IS NOT NULL
      GROUP BY classification_result
    `

    // Get hourly distribution (last 7 days)
    const hourlyDistribution = await sql`
      SELECT
        EXTRACT(HOUR FROM started_at) as hour,
        COUNT(*) as contact_count
      FROM contact_sessions
      WHERE started_at >= NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM started_at)
      ORDER BY hour
    `

    // Get unique users count
    const uniqueUsers = await sql`
      SELECT COUNT(DISTINCT user_session_id) as unique_users
      FROM contact_sessions
      WHERE user_session_id IS NOT NULL
    `

    return res.status(200).json({
      success: true,
      data: {
        overall: overallStats.rows[0] || {},
        aiAccuracy: aiAccuracy.rows[0] || {},
        recentContacts: recentContacts.rows,
        dailyMetrics: dailyMetrics.rows,
        classificationBreakdown: classificationBreakdown.rows,
        hourlyDistribution: hourlyDistribution.rows,
        uniqueUsers: uniqueUsers.rows[0]?.unique_users || 0
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      message: error.message
    })
  }
}
