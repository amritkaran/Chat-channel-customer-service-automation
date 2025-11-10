import { describe, it, expect, beforeAll } from 'vitest'
import { detectClosureStatement } from '../utils/closureDetector'
import { closureTestDataset, getDatasetStats } from './data/closureTestDataset'

/**
 * AI Accuracy Validation Tests
 * Tests closure detection against a comprehensive labeled dataset
 * Measures: Precision, Recall, F1 Score, Accuracy
 */

describe('AI Closure Detection Accuracy', () => {
  let results = []
  let metrics = {
    truePositives: 0,
    trueNegatives: 0,
    falsePositives: 0,
    falseNegatives: 0
  }

  beforeAll(async () => {
    console.log('\n📊 Running AI Accuracy Validation...\n')
    console.log('Dataset Stats:', getDatasetStats())
    console.log('\nTesting', closureTestDataset.length, 'examples...\n')

    // Run detection on all test cases
    for (const testCase of closureTestDataset) {
      const result = await detectClosureStatement(testCase.message, true)
      const predicted = result.isClosure
      const actual = testCase.expected

      results.push({
        message: testCase.message,
        category: testCase.category,
        expected: actual,
        predicted: predicted,
        correct: predicted === actual,
        details: result.details
      })

      // Update confusion matrix
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

    // Calculate metrics
    const precision = metrics.truePositives / (metrics.truePositives + metrics.falsePositives)
    const recall = metrics.truePositives / (metrics.truePositives + metrics.falseNegatives)
    const f1Score = 2 * (precision * recall) / (precision + recall)
    const accuracy = (metrics.truePositives + metrics.trueNegatives) / closureTestDataset.length

    metrics.precision = precision
    metrics.recall = recall
    metrics.f1Score = f1Score
    metrics.accuracy = accuracy

    // Print results
    console.log('\n' + '='.repeat(60))
    console.log('AI ACCURACY METRICS')
    console.log('='.repeat(60))
    console.log(`Accuracy:  ${(accuracy * 100).toFixed(2)}%`)
    console.log(`Precision: ${(precision * 100).toFixed(2)}%`)
    console.log(`Recall:    ${(recall * 100).toFixed(2)}%`)
    console.log(`F1 Score:  ${(f1Score * 100).toFixed(2)}%`)
    console.log('='.repeat(60))
    console.log('\nConfusion Matrix:')
    console.log(`  True Positives:  ${metrics.truePositives}`)
    console.log(`  True Negatives:  ${metrics.trueNegatives}`)
    console.log(`  False Positives: ${metrics.falsePositives}`)
    console.log(`  False Negatives: ${metrics.falseNegatives}`)
    console.log('='.repeat(60))

    // Print failures
    const failures = results.filter(r => !r.correct)
    if (failures.length > 0) {
      console.log('\n❌ FAILURES (' + failures.length + '):')
      failures.forEach((f, idx) => {
        console.log(`\n${idx + 1}. "${f.message}"`)
        console.log(`   Category: ${f.category}`)
        console.log(`   Expected: ${f.expected}, Got: ${f.predicted}`)
        if (f.details) {
          console.log(`   Max Similarity: ${f.details.maxSimilarity?.toFixed(3)}`)
          console.log(`   Most Similar: "${f.details.mostSimilarExample}"`)
        }
      })
    }
    console.log('\n')
  }, 300000) // 5 minute timeout for all API calls

  it('should achieve >85% accuracy', () => {
    expect(metrics.accuracy).toBeGreaterThan(0.85)
  })

  it('should achieve >80% precision (low false positive rate)', () => {
    expect(metrics.precision).toBeGreaterThan(0.80)
  })

  it('should achieve >80% recall (low false negative rate)', () => {
    expect(metrics.recall).toBeGreaterThan(0.80)
  })

  it('should achieve >80% F1 score (balanced performance)', () => {
    expect(metrics.f1Score).toBeGreaterThan(0.80)
  })

  it('should have fewer than 5 false positives', () => {
    expect(metrics.falsePositives).toBeLessThan(5)
  })

  it('should have fewer than 8 false negatives', () => {
    expect(metrics.falseNegatives).toBeLessThan(8)
  })

  describe('Category-specific accuracy', () => {
    it('should correctly detect direct closure statements (>95%)', () => {
      const categoryResults = results.filter(r => r.category === 'direct_closure')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.95)
    })

    it('should correctly detect gratitude-based closures (>90%)', () => {
      const categoryResults = results.filter(r => r.category === 'gratitude_closure')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.90)
    })

    it('should correctly detect farewell closures (>90%)', () => {
      const categoryResults = results.filter(r => r.category === 'farewell_closure')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.90)
    })

    it('should correctly reject problem-solving statements (>90%)', () => {
      const categoryResults = results.filter(r => r.category === 'problem_solving')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.90)
    })

    it('should correctly reject information requests (>90%)', () => {
      const categoryResults = results.filter(r => r.category === 'information_request')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.90)
    })
  })

  describe('Edge case handling', () => {
    it('should correctly handle short messages', () => {
      const categoryResults = results.filter(r => r.category === 'edge_case_short')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      // At least 2 out of 3 should be correct
      expect(accuracy).toBeGreaterThan(0.66)
    })

    it('should correctly handle ambiguous cases', () => {
      const categoryResults = results.filter(r => r.category === 'edge_case_ambiguous')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.66)
    })

    it('should avoid false positives on keyword matches', () => {
      const categoryResults = results.filter(r => r.category === 'edge_case_false_positive')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.80)
    })
  })

  describe('Robustness', () => {
    it('should handle multi-sentence messages', () => {
      const categoryResults = results.filter(r => r.category === 'multi_sentence')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.85)
    })

    it('should handle variations of closure statements', () => {
      const categoryResults = results.filter(r => r.category === 'variation')
      const correct = categoryResults.filter(r => r.correct).length
      const accuracy = correct / categoryResults.length

      expect(accuracy).toBeGreaterThan(0.90)
    })
  })
})
