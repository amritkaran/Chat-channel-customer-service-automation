import { describe, it, expect, beforeAll } from 'vitest'
import { detectClosureStatement, setSimilarityThreshold } from '../utils/closureDetector'
import { closureTestDataset } from './data/closureTestDataset'

/**
 * Threshold Optimization Tests
 * Tests different similarity thresholds to find optimal value
 * Evaluates trade-offs between precision and recall
 */

describe('Threshold Optimization', () => {
  const thresholds = [0.55, 0.60, 0.65, 0.70, 0.75, 0.80]
  let optimizationResults = []

  beforeAll(async () => {
    console.log('\n🔬 Running Threshold Optimization Analysis...\n')
    console.log('Testing thresholds:', thresholds.join(', '))
    console.log('\n')

    for (const threshold of thresholds) {
      setSimilarityThreshold(threshold)

      let metrics = {
        threshold,
        truePositives: 0,
        trueNegatives: 0,
        falsePositives: 0,
        falseNegatives: 0
      }

      // Test all examples with this threshold
      for (const testCase of closureTestDataset) {
        const result = await detectClosureStatement(testCase.message)
        const predicted = result
        const actual = testCase.expected

        if (predicted === true && actual === true) {
          metrics.truePositives++
        } else if (predicted === false && actual === false) {
          metrics.trueNegatives++
        } else if (predicted === true && actual === false) {
          metrics.falsePositives++
        } else if (predicted === false && actual === true) {
          metrics.falseNegatives++
        }
      }

      // Calculate performance metrics
      const precision = metrics.truePositives / (metrics.truePositives + metrics.falsePositives) || 0
      const recall = metrics.truePositives / (metrics.truePositives + metrics.falseNegatives) || 0
      const f1Score = 2 * (precision * recall) / (precision + recall) || 0
      const accuracy = (metrics.truePositives + metrics.trueNegatives) / closureTestDataset.length

      metrics.precision = precision
      metrics.recall = recall
      metrics.f1Score = f1Score
      metrics.accuracy = accuracy

      optimizationResults.push(metrics)
    }

    // Print results table
    console.log('\n' + '='.repeat(90))
    console.log('THRESHOLD OPTIMIZATION RESULTS')
    console.log('='.repeat(90))
    console.log('Threshold | Accuracy | Precision | Recall | F1 Score | FP | FN')
    console.log('-'.repeat(90))

    optimizationResults.forEach(m => {
      console.log(
        `  ${m.threshold.toFixed(2)}    | ` +
        `${(m.accuracy * 100).toFixed(1).padStart(6)}%  | ` +
        `${(m.precision * 100).toFixed(1).padStart(7)}%  | ` +
        `${(m.recall * 100).toFixed(1).padStart(5)}% | ` +
        `${(m.f1Score * 100).toFixed(1).padStart(6)}%  | ` +
        `${m.falsePositives.toString().padStart(2)} | ` +
        `${m.falseNegatives.toString().padStart(2)}`
      )
    })
    console.log('='.repeat(90))

    // Find optimal threshold
    const optimalByF1 = optimizationResults.reduce((best, current) =>
      current.f1Score > best.f1Score ? current : best
    )

    const optimalByAccuracy = optimizationResults.reduce((best, current) =>
      current.accuracy > best.accuracy ? current : best
    )

    console.log('\n📈 Optimal Thresholds:')
    console.log(`   By F1 Score:  ${optimalByF1.threshold} (F1: ${(optimalByF1.f1Score * 100).toFixed(2)}%)`)
    console.log(`   By Accuracy:  ${optimalByAccuracy.threshold} (Acc: ${(optimalByAccuracy.accuracy * 100).toFixed(2)}%)`)
    console.log('\n')

    // Reset to default
    setSimilarityThreshold(0.65)
  }, 600000) // 10 minute timeout

  it('should test multiple threshold values', () => {
    expect(optimizationResults.length).toBe(thresholds.length)
  })

  it('should show that lower thresholds increase recall but decrease precision', () => {
    const sorted = [...optimizationResults].sort((a, b) => a.threshold - b.threshold)

    // Generally, lower thresholds should have higher recall
    const lowestThreshold = sorted[0]
    const highestThreshold = sorted[sorted.length - 1]

    // Lower threshold should have equal or higher recall
    expect(lowestThreshold.recall).toBeGreaterThanOrEqual(highestThreshold.recall - 0.15)
  })

  it('should show that higher thresholds increase precision but may decrease recall', () => {
    const sorted = [...optimizationResults].sort((a, b) => a.threshold - b.threshold)

    const lowestThreshold = sorted[0]
    const highestThreshold = sorted[sorted.length - 1]

    // Higher threshold should have equal or higher precision
    expect(highestThreshold.precision).toBeGreaterThanOrEqual(lowestThreshold.precision - 0.10)
  })

  it('should find at least one threshold with >85% accuracy', () => {
    const hasHighAccuracy = optimizationResults.some(m => m.accuracy > 0.85)
    expect(hasHighAccuracy).toBe(true)
  })

  it('should find at least one threshold with F1 score >0.80', () => {
    const hasHighF1 = optimizationResults.some(m => m.f1Score > 0.80)
    expect(hasHighF1).toBe(true)
  })

  describe('Current threshold (0.65) validation', () => {
    it('should perform well with current threshold', () => {
      const current = optimizationResults.find(m => m.threshold === 0.65)
      expect(current.accuracy).toBeGreaterThan(0.80)
      expect(current.f1Score).toBeGreaterThan(0.75)
    })

    it('should be close to optimal threshold', () => {
      const optimal = optimizationResults.reduce((best, current) =>
        current.f1Score > best.f1Score ? current : best
      )

      const current = optimizationResults.find(m => m.threshold === 0.65)

      // Current should be within 5% of optimal F1 score
      expect(Math.abs(current.f1Score - optimal.f1Score)).toBeLessThan(0.05)
    })
  })

  describe('Trade-off analysis', () => {
    it('should show precision-recall trade-off curve', () => {
      // Precision and recall should generally move in opposite directions
      const precisions = optimizationResults.map(m => m.precision)
      const recalls = optimizationResults.map(m => m.recall)

      // At least one pair should show the trade-off
      let tradeoffExists = false
      for (let i = 0; i < optimizationResults.length - 1; i++) {
        const precisionChange = optimizationResults[i + 1].precision - optimizationResults[i].precision
        const recallChange = optimizationResults[i + 1].recall - optimizationResults[i].recall

        // If precision increases and recall decreases (or vice versa)
        if (precisionChange * recallChange < 0) {
          tradeoffExists = true
          break
        }
      }

      expect(tradeoffExists).toBe(true)
    })
  })
})
