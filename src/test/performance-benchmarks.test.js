import { describe, it, expect } from 'vitest'
import { cosineSimilarity } from '../utils/embeddingService'
import { detectClosureStatement } from '../utils/closureDetector'

/**
 * Performance Benchmark Tests
 * Measures execution time and efficiency of AI operations
 */

describe('Performance Benchmarks', () => {
  describe('Cosine Similarity Performance', () => {
    it('should compute similarity for 1536-dim vectors in <5ms', () => {
      const vecA = Array(1536).fill(0).map(() => Math.random())
      const vecB = Array(1536).fill(0).map(() => Math.random())

      const iterations = 100
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        cosineSimilarity(vecA, vecB)
      }

      const endTime = performance.now()
      const avgTime = (endTime - startTime) / iterations

      console.log(`\n⚡ Cosine Similarity (1536-dim): ${avgTime.toFixed(3)}ms average`)

      expect(avgTime).toBeLessThan(5)
    })

    it('should handle 100 comparisons in <200ms', () => {
      const vectors = Array(100).fill(0).map(() =>
        Array(1536).fill(0).map(() => Math.random())
      )

      const queryVector = Array(1536).fill(0).map(() => Math.random())

      const startTime = performance.now()

      vectors.forEach(vec => {
        cosineSimilarity(queryVector, vec)
      })

      const endTime = performance.now()
      const totalTime = endTime - startTime

      console.log(`⚡ 100 Similarity Comparisons: ${totalTime.toFixed(2)}ms total`)

      expect(totalTime).toBeLessThan(200)
    })

    it('should scale linearly with vector dimension', () => {
      const dimensions = [128, 256, 512, 1024, 1536]
      const times = []

      dimensions.forEach(dim => {
        const vecA = Array(dim).fill(0).map(() => Math.random())
        const vecB = Array(dim).fill(0).map(() => Math.random())

        const startTime = performance.now()

        for (let i = 0; i < 100; i++) {
          cosineSimilarity(vecA, vecB)
        }

        const endTime = performance.now()
        times.push((endTime - startTime) / 100)
      })

      console.log('\n⚡ Scaling by Dimension:')
      dimensions.forEach((dim, idx) => {
        console.log(`   ${dim}d: ${times[idx].toFixed(3)}ms`)
      })

      // Should scale roughly linearly (allow 2x variance)
      const ratio = times[times.length - 1] / times[0]
      const expectedRatio = dimensions[dimensions.length - 1] / dimensions[0]

      expect(ratio).toBeLessThan(expectedRatio * 2)
    })
  })

  describe('Closure Detection Performance', () => {
    it('should detect closure in reasonable time', async () => {
      const message = "Is there anything else I can help you with?"

      const startTime = performance.now()
      await detectClosureStatement(message)
      const endTime = performance.now()

      const detectionTime = endTime - startTime

      console.log(`\n⚡ Closure Detection Time: ${detectionTime.toFixed(2)}ms`)

      // Should complete within 2 seconds (includes API call)
      expect(detectionTime).toBeLessThan(2000)
    }, 30000)

    it('should efficiently process multiple messages', async () => {
      const messages = [
        "Is there anything else I can help you with?",
        "Let me check that for you",
        "Have a great day!",
        "What seems to be the problem?",
        "Thanks for contacting us today"
      ]

      const startTime = performance.now()

      for (const message of messages) {
        await detectClosureStatement(message)
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / messages.length

      console.log(`\n⚡ Average Detection Time (${messages.length} messages):`)
      console.log(`   Total: ${totalTime.toFixed(2)}ms`)
      console.log(`   Average: ${avgTime.toFixed(2)}ms`)

      // Average should be under 2 seconds per message
      expect(avgTime).toBeLessThan(2000)
    }, 60000)
  })

  describe('Memory Efficiency', () => {
    it('should handle large vector operations without excessive memory', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0

      // Create and process 1000 large vectors
      const vectors = []
      for (let i = 0; i < 1000; i++) {
        vectors.push(Array(1536).fill(0).map(() => Math.random()))
      }

      const queryVector = Array(1536).fill(0).map(() => Math.random())

      // Perform comparisons
      vectors.forEach(vec => {
        cosineSimilarity(queryVector, vec)
      })

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      if (performance.memory) {
        console.log(`\n💾 Memory Usage (1000 vectors):`)
        console.log(`   Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`)
        console.log(`   Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`)
        console.log(`   Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)

        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      } else {
        console.log('\n💾 Memory API not available in this environment')
      }
    })
  })

  describe('Throughput', () => {
    it('should achieve >50 similarity computations per second', () => {
      const vecA = Array(1536).fill(0).map(() => Math.random())
      const vecB = Array(1536).fill(0).map(() => Math.random())

      const duration = 1000 // 1 second
      const startTime = performance.now()
      let iterations = 0

      while (performance.now() - startTime < duration) {
        cosineSimilarity(vecA, vecB)
        iterations++
      }

      const actualDuration = performance.now() - startTime
      const throughput = (iterations / actualDuration) * 1000

      console.log(`\n🚀 Throughput: ${throughput.toFixed(0)} comparisons/second`)

      expect(throughput).toBeGreaterThan(50)
    })
  })

  describe('Consistency', () => {
    it('should have consistent performance across multiple runs', () => {
      const vecA = Array(1536).fill(0).map(() => Math.random())
      const vecB = Array(1536).fill(0).map(() => Math.random())

      const times = []
      const runs = 10

      for (let run = 0; run < runs; run++) {
        const startTime = performance.now()

        for (let i = 0; i < 100; i++) {
          cosineSimilarity(vecA, vecB)
        }

        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const stdDev = Math.sqrt(
        times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length
      )

      const coefficientOfVariation = stdDev / avgTime

      console.log(`\n📊 Performance Consistency (${runs} runs):`)
      console.log(`   Average: ${avgTime.toFixed(2)}ms`)
      console.log(`   Std Dev: ${stdDev.toFixed(2)}ms`)
      console.log(`   CV: ${(coefficientOfVariation * 100).toFixed(2)}%`)

      // Coefficient of variation should be less than 20%
      expect(coefficientOfVariation).toBeLessThan(0.20)
    })
  })
})
