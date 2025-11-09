import { getEmbedding, cosineSimilarity } from './embeddingService'

const CLOSURE_EXAMPLES = [
  "Hope I was able to help you",
  "Is there anything else I can help you with?",
  "Do you need any other help?",
  "Anything else I can assist you with?",
  "Glad I could help",
  "Happy I could assist you",
  "Great talking to you",
  "Nice talking to you",
  "Have a great day",
  "Have a wonderful day",
  "Take care",
  "If you need anything else, feel free to reach out",
  "Feel free to contact us if you need anything",
  "Don't hesitate to reach out",
  "Is there something else I can help with?",
  "Can I help you with anything else?",
  "Will that be all?",
  "Anything else for you today?",
  "Is there anything else you need assistance with?",
  "Let me know if you need anything else",
  "Thanks for contacting today",
  "Glad I was able to help you, is there anything else you need help with",
  "Hope I was able to help you with, is there anything else I can help you today",
]

let SIMILARITY_THRESHOLD = 0.65

let closureEmbeddings = null
let isInitialized = false
let initializationPromise = null

async function initializeClosureEmbeddings() {
  if (isInitialized) {
    return closureEmbeddings
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    try {
      console.log('Initializing closure embeddings...')
      const embeddings = await Promise.all(
        CLOSURE_EXAMPLES.map(example => getEmbedding(example))
      )
      closureEmbeddings = embeddings
      isInitialized = true
      console.log(`Initialized ${embeddings.length} closure embeddings`)
      return embeddings
    } catch (error) {
      console.error('Failed to initialize closure embeddings:', error)
      initializationPromise = null
      throw error
    }
  })()

  return initializationPromise
}

export async function detectClosureStatement(message, returnDetails = false) {
  if (!message || typeof message !== 'string') {
    return returnDetails ? { isClosure: false, details: null } : false
  }

  const normalizedMessage = message.trim()

  if (normalizedMessage.length < 5) {
    return returnDetails ? { isClosure: false, details: null } : false
  }

  try {
    await initializeClosureEmbeddings()

    const messageEmbedding = await getEmbedding(normalizedMessage)

    let maxSimilarity = 0
    let mostSimilarExample = ''
    let allSimilarities = []

    for (let i = 0; i < closureEmbeddings.length; i++) {
      const similarity = cosineSimilarity(messageEmbedding, closureEmbeddings[i])

      allSimilarities.push({
        example: CLOSURE_EXAMPLES[i],
        score: similarity
      })

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
        mostSimilarExample = CLOSURE_EXAMPLES[i]
      }
    }

    // Sort by similarity and get top 3
    allSimilarities.sort((a, b) => b.score - a.score)
    const top3 = allSimilarities.slice(0, 3)

    const isClosure = maxSimilarity >= SIMILARITY_THRESHOLD

    console.log(`📊 Message: "${normalizedMessage}"`)
    console.log(`   Top similarities:`)
    top3.forEach((item, idx) => {
      console.log(`     ${idx + 1}. [${item.score.toFixed(3)}] "${item.example}"`)
    })
    console.log(`   Max similarity: ${maxSimilarity.toFixed(3)} (threshold: ${SIMILARITY_THRESHOLD})`)
    console.log(`   ✓ Closure detected: ${isClosure ? 'YES ✅' : 'NO ❌'}`)
    console.log('')

    if (returnDetails) {
      return {
        isClosure,
        details: {
          message: normalizedMessage,
          maxSimilarity,
          mostSimilarExample,
          threshold: SIMILARITY_THRESHOLD,
          top3Matches: top3,
          passed: isClosure
        }
      }
    }

    return isClosure
  } catch (error) {
    console.error('Error in closure detection:', error)
    const fallback = fallbackClosureDetection(normalizedMessage)
    return returnDetails ? { isClosure: fallback, details: null } : fallback
  }
}

function fallbackClosureDetection(message) {
  const closureKeywords = [
    'anything else',
    'help you with',
    'great day',
    'take care',
    'glad i could',
    'happy to help',
    'hope i was able',
    'will that be all',
  ]

  const lowerMessage = message.toLowerCase()

  for (const keyword of closureKeywords) {
    if (lowerMessage.includes(keyword)) {
      console.log('Closure detected using fallback method')
      return true
    }
  }

  return false
}

export function addClosureExample(example) {
  if (typeof example === 'string' && example.trim().length > 0) {
    CLOSURE_EXAMPLES.push(example.trim())
    isInitialized = false
    closureEmbeddings = null
    console.log(`Added new closure example: "${example}"`)
  }
}

export function getClosureExamples() {
  return [...CLOSURE_EXAMPLES]
}

export function setSimilarityThreshold(threshold) {
  if (threshold >= 0 && threshold <= 1) {
    SIMILARITY_THRESHOLD = threshold
    console.log(`Similarity threshold updated to ${threshold}`)
  }
}
