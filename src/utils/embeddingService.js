const API_CONFIG = {
  // Use serverless API route in production, direct API in development
  endpoint: import.meta.env.PROD ? '/api/embeddings' : 'https://api.openai.com/v1/embeddings',
  isDevelopment: !import.meta.env.PROD,
  apiKey: import.meta.env.VITE_LLM_API_KEY || '',
  embeddingModel: 'text-embedding-3-small'
}

let embeddingCache = new Map()

export async function getEmbedding(text) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)
  }

  try {
    let response

    if (API_CONFIG.isDevelopment) {
      // Development: Call OpenAI directly (requires VITE_LLM_API_KEY)
      if (!API_CONFIG.apiKey) {
        throw new Error('API key not configured. Add VITE_LLM_API_KEY to your .env file')
      }

      response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: API_CONFIG.embeddingModel,
          input: text
        })
      })

      if (!response.ok) {
        throw new Error(`Embedding API request failed: ${response.status}`)
      }

      const data = await response.json()
      const embedding = data.data[0].embedding
      embeddingCache.set(text, embedding)
      return embedding
    } else {
      // Production: Call secure serverless function
      response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Embedding request failed')
      }

      const data = await response.json()
      embeddingCache.set(text, data.embedding)
      return data.embedding
    }
  } catch (error) {
    console.error('Error getting embedding:', error)
    throw error
  }
}

export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

export function clearEmbeddingCache() {
  embeddingCache.clear()
}
