import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load .env file explicitly with dotenv
dotenv.config()

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // Use dotenv vars as fallback
  const apiKey = env.VITE_LLM_API_KEY || process.env.VITE_LLM_API_KEY
  const model = env.VITE_LLM_MODEL || process.env.VITE_LLM_MODEL
  const endpoint = env.VITE_LLM_ENDPOINT || process.env.VITE_LLM_ENDPOINT

  return {
    plugins: [react()],
    // Define import.meta.env values explicitly for tests
    define: {
      'import.meta.env.VITE_LLM_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_LLM_MODEL': JSON.stringify(model),
      'import.meta.env.VITE_LLM_ENDPOINT': JSON.stringify(endpoint)
    },
    test: {
      environment: 'node',
      globals: true,
      setupFiles: './src/test/setup.js',
      // Make VITE_ env vars available to tests
      env: {
        VITE_LLM_API_KEY: apiKey,
        VITE_LLM_MODEL: model,
        VITE_LLM_ENDPOINT: endpoint
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{js,jsx}'],
        exclude: [
          'src/main.jsx',
          'src/**/*.test.{js,jsx}',
          'src/test/**'
        ]
      }
    }
  }
})
