import OpenAI from 'openai'

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
    const { conversationContext, returnDetails } = req.body

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const conversationText = conversationContext
      .map(msg => `${msg.role === 'customer' ? 'Customer' : 'Agent'}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `You are analyzing a customer service conversation to determine the customer's intent after the agent has provided a closure statement (like "Is there anything else I can help you with?").

Your task is to classify the customer's MOST RECENT response into one of three categories:

1. "needs_help" - Customer indicates they need MORE help, have ANOTHER issue, are unhappy with the resolution, or want to continue the conversation
   Examples:
   - "Wait, I have another question"
   - "Actually, that didn't work"
   - "I'm still having problems"
   - "Yes, I need help with..."
   - "Can you help me with something else?"
   - "What about..."

2. "satisfied" - Customer indicates they are DONE, satisfied, have NO MORE issues, or are declining further assistance
   Examples:
   - "No, that's all. Thank you!"
   - "Nope, I'm good"
   - "No, thank you for your help"
   - "Thanks for your assistance"
   - "Perfect, that worked!"
   - "All set, thanks"
   - "I appreciate your help"
   - Any response that clearly says "no" to needing more help

3. "uncertain" - The response is ambiguous, off-topic, or unclear about whether they need more help
   Examples:
   - "ok"
   - "sure"
   - "alright"
   - Single word responses without clear intent

CRITICAL RULES:
- If the customer says "No" or "Nope" in response to "anything else?", classify as "satisfied"
- If the customer says "thank you" WITHOUT mentioning a new issue, classify as "satisfied"
- If the customer mentions a NEW issue or problem, classify as "needs_help"
- Focus on the customer's MOST RECENT message after the closure question

Respond with ONLY one word: "needs_help", "satisfied", or "uncertain"`

    const userPrompt = `Here is the conversation:\n\n${conversationText}\n\nClassify the customer's overall intent based on their most recent messages after the closure statement.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    })

    const classification = response.choices[0].message.content.trim().toLowerCase()
    const isValid = ['needs_help', 'satisfied', 'uncertain'].includes(classification)
    const finalClassification = isValid ? classification : 'uncertain'

    if (returnDetails) {
      const lastCustomerMessage = conversationContext
        .filter(msg => msg.role === 'customer')
        .slice(-1)[0]?.content || ''

      return res.status(200).json({
        classification: finalClassification,
        details: {
          customerMessage: lastCustomerMessage,
          conversationContext: conversationContext.length,
          llmResponse: classification,
          model: 'gpt-4o-mini',
          systemPrompt,
          userPrompt,
          isValid
        }
      })
    }

    return res.status(200).json({ classification: finalClassification })
  } catch (error) {
    console.error('Error classifying response:', error)
    return res.status(500).json({
      classification: 'uncertain',
      error: error.message
    })
  }
}
