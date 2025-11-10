import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Make sure environment variables are available to import.meta.env
if (process.env.VITE_LLM_API_KEY) {
  import.meta.env.VITE_LLM_API_KEY = process.env.VITE_LLM_API_KEY
}
if (process.env.VITE_LLM_MODEL) {
  import.meta.env.VITE_LLM_MODEL = process.env.VITE_LLM_MODEL
}
if (process.env.VITE_LLM_ENDPOINT) {
  import.meta.env.VITE_LLM_ENDPOINT = process.env.VITE_LLM_ENDPOINT
}

// Cleanup after each test
afterEach(() => {
  cleanup()
})
