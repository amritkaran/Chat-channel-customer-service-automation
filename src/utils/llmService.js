const API_CONFIG = {
  provider: 'openai',
  apiKey: import.meta.env.VITE_LLM_API_KEY || '',
  model: import.meta.env.VITE_LLM_MODEL || 'gpt-3.5-turbo',
  endpoint: import.meta.env.VITE_LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
}

export async function generateCustomerMessage(conversationContext) {
  if (!API_CONFIG.apiKey) {
    console.warn('No API key configured. Using mock response.')
    return getMockCustomerResponse(conversationContext)
  }

  try {
    // Build the conversation history as a single user prompt
    let conversationText = 'Here is a customer service conversation:\n\n'

    conversationContext.forEach((msg, idx) => {
      if (msg.role === 'customer') {
        conversationText += `Customer: ${msg.content}\n`
      } else {
        conversationText += `Agent: ${msg.content}\n`
      }
    })

    conversationText += '\nGenerate the customer\'s next response (what the customer would say next). Keep it brief (1-3 sentences). Remember, you are the CUSTOMER with a problem, not the support agent.'

    // Count how many customer questions have been asked
    const customerQuestionCount = conversationContext.filter(msg =>
      msg.role === 'customer' && msg.content.includes('?')
    ).length

    // Count total conversation exchanges
    const exchangeCount = conversationContext.filter(msg => msg.role === 'agent').length

    let customerPersona = `You are helping to simulate a customer service conversation by generating what a customer would say. The customer has an issue and is talking to a support agent.

IMPORTANT RULES:
- Generate realistic, brief customer responses (1-2 sentences MAXIMUM)
- You are a COOPERATIVE and REASONABLE customer
- When the agent provides a good solution, accept it with appreciation`

    if (customerQuestionCount >= 1) {
      customerPersona += `\n- STOP ASKING QUESTIONS - You have already asked ${customerQuestionCount} question(s). DO NOT ask any more questions.`
      customerPersona += `\n- Express satisfaction and thank the agent for their help`
      customerPersona += `\n- Say things like "That's perfect, thank you!" or "Great, I understand now, thanks!"`
    } else if (exchangeCount >= 2) {
      customerPersona += `\n- You may ask AT MOST 1 brief clarifying question if needed`
      customerPersona += `\n- After getting an answer, express satisfaction if the solution works for you`
    } else {
      customerPersona += `\n- Describe your issue briefly in the first message`
    }

    customerPersona += `\n- Respond naturally to the agent's questions - be honest about whether you're satisfied or need more help`
    customerPersona += `\n- You are the customer with a problem, NOT the helpful agent`

    const messages = [
      {
        role: 'system',
        content: customerPersona
      },
      {
        role: 'user',
        content: conversationText
      }
    ]

    console.log('🤖 LLM Request Messages:', JSON.stringify(messages, null, 2))

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: messages,
        temperature: 0.8,
        max_tokens: 150,
        user: "customer_simulator"
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const customerResponse = data.choices[0].message.content.trim()
    console.log('🤖 LLM Response (Customer):', customerResponse)
    return customerResponse
  } catch (error) {
    console.error('Error calling LLM API:', error)
    return getMockCustomerResponse(conversationContext)
  }
}

function getMockCustomerResponse(conversationContext) {
  const lastMessage = conversationContext[conversationContext.length - 1]
  const agentMessage = lastMessage?.content?.toLowerCase() || ''

  if (agentMessage.includes('help') && agentMessage.includes('else')) {
    const responses = [
      "No, that's all. Thank you so much for your help!",
      "I think I'm all set now, thanks!",
      "Actually, I'm good now. Thanks for sorting this out!",
      "Nope, you've been very helpful. Have a great day!",
      "That should do it. I appreciate your assistance!"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (agentMessage.includes('order') || conversationContext.length <= 2) {
    const responses = [
      "I placed an order last week but haven't received a confirmation email.",
      "My order number is #12345. Can you check its status?",
      "I was supposed to get a tracking number but never received it.",
      "The payment went through but I'm not sure if the order was processed."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (agentMessage.includes('sorry') || agentMessage.includes('apologize')) {
    const responses = [
      "I appreciate that. Can you help me resolve this?",
      "Thank you. What can we do to fix this?",
      "Okay, what are the next steps?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (agentMessage.includes('refund') || agentMessage.includes('return')) {
    const responses = [
      "Yes, a refund would be great. How long does that take?",
      "That works for me. When should I expect the refund?",
      "Okay, and will I need to return the item first?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const genericResponses = [
    "That sounds good, thank you!",
    "Great, I appreciate your help with this.",
    "Okay, that makes sense.",
    "Perfect, thanks for clarifying!",
    "Alright, I understand now."
  ]
  return genericResponses[Math.floor(Math.random() * genericResponses.length)]
}

export function configureLLM(config) {
  Object.assign(API_CONFIG, config)
}
