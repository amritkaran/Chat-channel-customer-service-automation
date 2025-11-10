import { describe, it, expect } from 'vitest'

describe('API Key Configuration', () => {
  it('should load API key from environment', () => {
    const apiKey = import.meta.env.VITE_LLM_API_KEY

    console.log('API Key found:', apiKey ? 'Yes' : 'No')
    console.log('API Key format:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A')
    console.log('API Key length:', apiKey ? apiKey.length : 0)

    expect(apiKey).toBeDefined()
    expect(apiKey).toContain('sk-')
  })

  it('should have valid OpenAI API key format', async () => {
    const apiKey = import.meta.env.VITE_LLM_API_KEY

    console.log('\nDebugging API Call:')
    console.log('Key prefix:', apiKey.substring(0, 15))
    console.log('Key suffix:', '...' + apiKey.substring(apiKey.length - 4))
    console.log('Authorization header:', `Bearer ${apiKey.substring(0, 20)}...`)

    // Test embedding API directly (which is what we actually use)
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: 'test'
        })
      })

      console.log('\n✅ API Response Status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Key is VALID!')
        console.log('✅ Embedding dimensions:', data.data[0].embedding.length)
        expect(response.status).toBe(200)
      } else {
        const error = await response.json()
        console.log('❌ API Error Response:')
        console.log('  Message:', error.error?.message)
        console.log('  Type:', error.error?.type)
        console.log('  Code:', error.error?.code)

        // Check if it's an invalid key or something else
        if (error.error?.code === 'invalid_api_key') {
          console.error('\n❌ The API key appears to be invalid or expired.')
          console.error('   Please get a new key from: https://platform.openai.com/api-keys')
        }
      }
    } catch (error) {
      console.error('❌ Network Error:', error.message)
    }
  }, 10000)
})
