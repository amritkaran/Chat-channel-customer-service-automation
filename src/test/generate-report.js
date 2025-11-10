/**
 * Test Report Generator
 * Generates a comprehensive markdown report of AI testing results
 * Run after tests complete to create TEST_REPORT.md
 */

export function generateTestReport(metrics) {
  const date = new Date().toISOString().split('T')[0]

  return `# AI Testing Report - Customer Service Copilot

**Generated:** ${date}

## Executive Summary

This report presents comprehensive testing results for the AI-powered closure detection system in the Customer Service Copilot application.

### Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Accuracy** | ${(metrics.accuracy * 100).toFixed(2)}% | >85% | ${metrics.accuracy > 0.85 ? '✅ PASS' : '❌ FAIL'} |
| **Precision** | ${(metrics.precision * 100).toFixed(2)}% | >80% | ${metrics.precision > 0.80 ? '✅ PASS' : '❌ FAIL'} |
| **Recall** | ${(metrics.recall * 100).toFixed(2)}% | >80% | ${metrics.recall > 0.80 ? '✅ PASS' : '❌ FAIL'} |
| **F1 Score** | ${(metrics.f1Score * 100).toFixed(2)}% | >80% | ${metrics.f1Score > 0.80 ? '✅ PASS' : '❌ FAIL'} |

### Business Impact

- **False Positive Rate:** ${(metrics.falsePositives / (metrics.falsePositives + metrics.trueNegatives) * 100).toFixed(2)}% (Lower is better)
- **False Negative Rate:** ${(metrics.falseNegatives / (metrics.falseNegatives + metrics.truePositives) * 100).toFixed(2)}% (Lower is better)
- **Reliability Score:** ${(metrics.accuracy * 100).toFixed(1)}% of predictions are correct

## Test Coverage

### Dataset Composition

- **Total Test Cases:** ${metrics.totalCases}
- **Closure Statements (Positive):** ${metrics.truePositives + metrics.falseNegatives}
- **Non-Closure Statements (Negative):** ${metrics.trueNegatives + metrics.falsePositives}
- **Dataset Balance:** ${((metrics.truePositives + metrics.falseNegatives) / metrics.totalCases * 100).toFixed(1)}% positive

### Test Categories

1. **Direct Closure Statements** - "Is there anything else I can help you with?"
2. **Gratitude-Based Closures** - "Hope I was able to help you today"
3. **Farewell Closures** - "Have a great day!"
4. **Problem-Solving** - "Let me check that for you"
5. **Information Requests** - "Can you provide your account number?"
6. **Edge Cases** - Short messages, ambiguous statements

## Confusion Matrix

\`\`\`
                    Predicted
                Closure | Not Closure
              +----------+------------+
Actual        |          |            |
Closure       |   ${metrics.truePositives}     |     ${metrics.falseNegatives}      |  ← ${metrics.truePositives + metrics.falseNegatives} actual closures
              +----------+------------+
Not Closure   |   ${metrics.falsePositives}      |     ${metrics.trueNegatives}      |  ← ${metrics.trueNegatives + metrics.falsePositives} actual non-closures
              +----------+------------+
                 ${metrics.truePositives + metrics.falsePositives}          ${metrics.trueNegatives + metrics.falseNegatives}
              predicted   predicted
              closures    non-closures
\`\`\`

### Understanding the Results

- **True Positives (${metrics.truePositives}):** Correctly identified closure statements ✅
- **True Negatives (${metrics.trueNegatives}):** Correctly identified non-closure statements ✅
- **False Positives (${metrics.falsePositives}):** Incorrectly identified as closure (Type I Error) ❌
- **False Negatives (${metrics.falseNegatives}):** Missed closure statements (Type II Error) ❌

## Performance Characteristics

### Semantic Similarity Method

- **Model:** OpenAI text-embedding-3-small
- **Vector Dimension:** 1536
- **Similarity Metric:** Cosine Similarity
- **Current Threshold:** 0.65
- **Fallback Method:** Keyword matching

### Threshold Analysis

The current threshold of 0.65 provides a balanced trade-off between precision and recall:

- **Lower threshold (0.55-0.60):** Higher recall, more false positives
- **Current threshold (0.65):** Balanced performance
- **Higher threshold (0.70-0.80):** Higher precision, more false negatives

## Recommendations

### Strengths

1. **High Accuracy:** Model correctly classifies ${(metrics.accuracy * 100).toFixed(1)}% of test cases
2. **Balanced Performance:** Good balance between precision and recall
3. **Semantic Understanding:** Detects variations and paraphrases effectively

### Areas for Improvement

1. **False Positives:** ${metrics.falsePositives} cases incorrectly marked as closures
   - **Impact:** May cause premature conversation closure
   - **Mitigation:** Consider implementing 4-message rule (already in place)

2. **False Negatives:** ${metrics.falseNegatives} closure statements missed
   - **Impact:** Delayed conversation closure, increased handle time
   - **Mitigation:** Consider lowering threshold slightly or adding more training examples

### Next Steps

1. **Monitor Production Data:** Track actual closure detection accuracy with user feedback
2. **A/B Testing:** Test threshold values (0.60, 0.65, 0.70) with real users
3. **Continuous Learning:** Add new closure examples based on production data
4. **Performance Monitoring:** Track embedding API latency and costs

## Technical Specifications

### Test Framework

- **Framework:** Vitest
- **Test Types:** Unit, Integration, Performance
- **Total Tests:** Multiple suites
- **Execution Time:** Varies based on API calls

### AI Pipeline

1. **Embedding Generation:** OpenAI API call (~100ms)
2. **Similarity Computation:** Cosine similarity across 27 examples (<5ms)
3. **Threshold Comparison:** Binary classification (instant)
4. **Fallback Detection:** Keyword matching if API fails

## Appendix

### Test Execution

\`\`\`bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage
\`\`\`

### Metrics Definitions

- **Accuracy:** (TP + TN) / Total - Overall correctness
- **Precision:** TP / (TP + FP) - Accuracy of positive predictions
- **Recall:** TP / (TP + FN) - Coverage of actual positives
- **F1 Score:** Harmonic mean of precision and recall

---

*This report was automatically generated from automated test results.*
`
}

// Example usage
export function printReportExample() {
  const exampleMetrics = {
    accuracy: 0.89,
    precision: 0.92,
    recall: 0.87,
    f1Score: 0.89,
    truePositives: 24,
    trueNegatives: 38,
    falsePositives: 2,
    falseNegatives: 4,
    totalCases: 68
  }

  console.log(generateTestReport(exampleMetrics))
}
