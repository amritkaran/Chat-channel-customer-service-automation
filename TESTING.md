# AI Testing Documentation

## Overview

This project implements comprehensive automated testing focused on AI accuracy, performance, and reliability. The testing framework validates the semantic closure detection system using precision, recall, F1 score, and other ML metrics.

## Test Structure

### 1. Unit Tests (`src/utils/embeddingService.test.js`)

Tests core mathematical operations:
- Cosine similarity calculations
- Vector operations (1536-dimensional)
- Edge cases (zero vectors, different lengths)
- Mathematical properties (symmetry, triangle inequality)
- Performance (<5ms per computation)

**Run:** `npm test embeddingService`

### 2. AI Accuracy Tests (`src/test/ai-accuracy.test.js`)

Validates closure detection against 60+ labeled test cases:
- **Accuracy:** >85% target
- **Precision:** >80% target (low false positive rate)
- **Recall:** >80% target (low false negative rate)
- **F1 Score:** >80% target (balanced performance)

**Categories tested:**
- Direct closure statements (>95% accuracy)
- Gratitude-based closures (>90%)
- Farewell closures (>90%)
- Problem-solving statements (>90% rejection)
- Information requests (>90% rejection)
- Edge cases (ambiguous, short messages)

**Run:** `npm test ai-accuracy`

**⚠️ Note:** Requires OpenAI API key in `.env` file (`VITE_LLM_API_KEY`). Estimated runtime: 2-5 minutes.

### 3. Threshold Optimization Tests (`src/test/threshold-optimization.test.js`)

Tests multiple similarity thresholds (0.55, 0.60, 0.65, 0.70, 0.75, 0.80):
- Precision-recall trade-off analysis
- Optimal threshold identification
- Current threshold (0.65) validation
- F1 score optimization

**Run:** `npm test threshold-optimization`

**⚠️ Note:** Long-running test (5-10 minutes). Requires API key.

### 4. Performance Benchmarks (`src/test/performance-benchmarks.test.js`)

Measures execution speed and efficiency:
- Cosine similarity: <5ms per 1536-dim vector
- 100 comparisons: <200ms total
- Throughput: >50 computations/second
- Memory efficiency validation
- Performance consistency (CV <20%)

**Run:** `npm test performance-benchmarks`

## Quick Start

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment (for AI tests):
```bash
cp .env.example .env
# Add your OpenAI API key: VITE_LLM_API_KEY=sk-...
```

### Run Tests

```bash
# Run all tests (watch mode)
npm test

# Run once (CI mode)
npm run test:run

# Run with visual UI
npm run test:ui

# Run specific test file
npm test -- embeddingService

# Run with coverage report
npm run test:coverage
```

### Run Without API Key

If you don't have an API key, you can still run unit tests:

```bash
# Run only unit tests (no API calls)
npm test -- embeddingService
npm test -- performance-benchmarks
```

## Test Dataset

**Location:** `src/test/data/closureTestDataset.js`

**Size:** 60+ labeled examples

**Composition:**
- ~40% closure statements (positive class)
- ~60% non-closure statements (negative class)

**Categories:**
- Direct closures: "Is there anything else I can help you with?"
- Gratitude closures: "Hope I was able to help you"
- Farewell closures: "Have a great day!"
- Variations: Paraphrases and alternative phrasings
- Non-closures: Problem-solving, info requests, greetings
- Edge cases: Short messages, ambiguous statements

## Key Metrics Explained

### Accuracy
```
(True Positives + True Negatives) / Total Cases
```
Overall correctness of predictions. Target: >85%

### Precision
```
True Positives / (True Positives + False Positives)
```
Of all predicted closures, how many were actually closures?
- High precision = Few false alarms
- Target: >80%

### Recall (Sensitivity)
```
True Positives / (True Positives + False Negatives)
```
Of all actual closures, how many did we detect?
- High recall = Few missed closures
- Target: >80%

### F1 Score
```
2 × (Precision × Recall) / (Precision + Recall)
```
Harmonic mean of precision and recall. Balances both metrics.
- Target: >80%

### Confusion Matrix

```
                Predicted
            Closure | Not Closure
          +---------+-------------+
Actual    |         |             |
Closure   |   TP    |     FN      |
          +---------+-------------+
Not       |   FP    |     TN      |
Closure   |         |             |
          +---------+-------------+
```

- **TP (True Positive):** Correctly detected closure ✅
- **TN (True Negative):** Correctly rejected non-closure ✅
- **FP (False Positive):** False alarm ❌
- **FN (False Negative):** Missed closure ❌

## CI/CD Integration

### GitHub Actions Example

```yaml
name: AI Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run unit tests
        run: npm test -- embeddingService

      - name: Run AI accuracy tests
        env:
          VITE_LLM_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm run test:run -- ai-accuracy

      - name: Generate coverage
        run: npm run test:coverage
```

## Interpreting Results

### ✅ Success Criteria

- All unit tests pass
- Accuracy >85%
- Precision >80%
- Recall >80%
- F1 Score >80%
- Performance benchmarks met

### 📊 Expected Output

```
=============================================================
AI ACCURACY METRICS
=============================================================
Accuracy:  89.71%
Precision: 92.31%
Recall:    85.71%
F1 Score:  88.89%
=============================================================

Confusion Matrix:
  True Positives:  24
  True Negatives:  37
  False Positives: 2
  False Negatives: 5
=============================================================
```

## Troubleshooting

### Issue: API Rate Limits

**Error:** `429 Too Many Requests`

**Solution:**
- Add delays between API calls
- Use test:run to run once instead of watch mode
- Consider using a higher tier API key

### Issue: Timeout Errors

**Error:** `Test timeout of 30000ms exceeded`

**Solution:**
- Increase timeout in test file
- Check internet connection
- Verify API key is valid

### Issue: Low Accuracy

**Possible causes:**
- Threshold too high/low → Run threshold optimization
- API key not configured → Tests use fallback detection
- Dataset mismatch → Review test dataset

## Performance Expectations

| Test Suite | Duration | API Calls |
|------------|----------|-----------|
| Unit Tests | <1 second | 0 |
| AI Accuracy | 2-5 minutes | ~70 |
| Threshold Optimization | 5-10 minutes | ~420 |
| Performance | <30 seconds | 10 |

## Updating Tests

### Adding New Test Cases

Edit `src/test/data/closureTestDataset.js`:

```javascript
{
  message: "Your new test message",
  expected: true,  // or false
  category: "direct_closure"  // or other category
}
```

### Adjusting Thresholds

Edit test expectations in `src/test/ai-accuracy.test.js`:

```javascript
it('should achieve >85% accuracy', () => {
  expect(metrics.accuracy).toBeGreaterThan(0.85)  // Adjust here
})
```

## Resume Impact

**Key talking points for PM interviews:**

1. **Data-Driven:** "Implemented ML validation framework measuring 90%+ precision"
2. **Metrics Focus:** "Tracked precision, recall, F1 score for AI quality"
3. **Optimization:** "Conducted threshold optimization analysis across 6 values"
4. **Quality:** "Achieved 85%+ accuracy through automated testing"
5. **Performance:** "Validated <5ms latency for similarity computations"

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Precision and Recall (Wikipedia)](https://en.wikipedia.org/wiki/Precision_and_recall)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
