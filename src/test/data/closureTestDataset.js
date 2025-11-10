/**
 * Comprehensive test dataset for AI closure detection validation
 * Each entry has:
 * - message: the text to test
 * - expected: true (closure) or false (not closure)
 * - category: type of message for analysis
 */

export const closureTestDataset = [
  // ===== TRUE POSITIVES: Clear Closure Statements =====
  { message: "Is there anything else I can help you with?", expected: true, category: "direct_closure" },
  { message: "Do you need any other assistance?", expected: true, category: "direct_closure" },
  { message: "Anything else I can help with today?", expected: true, category: "direct_closure" },
  { message: "Will that be all for today?", expected: true, category: "direct_closure" },
  { message: "Can I help you with anything else?", expected: true, category: "direct_closure" },
  { message: "Is there something else I can assist you with?", expected: true, category: "direct_closure" },

  // Gratitude-based closures
  { message: "Hope I was able to help you today", expected: true, category: "gratitude_closure" },
  { message: "Glad I could assist you with that", expected: true, category: "gratitude_closure" },
  { message: "Happy I could help resolve that for you", expected: true, category: "gratitude_closure" },
  { message: "Thanks for contacting us today", expected: true, category: "gratitude_closure" },

  // Farewell-based closures
  { message: "Have a great day!", expected: true, category: "farewell_closure" },
  { message: "Have a wonderful evening", expected: true, category: "farewell_closure" },
  { message: "Take care and have a nice day", expected: true, category: "farewell_closure" },
  { message: "Great talking to you today", expected: true, category: "farewell_closure" },

  // Reach-out closures
  { message: "Feel free to reach out if you need anything else", expected: true, category: "reachout_closure" },
  { message: "Don't hesitate to contact us if you have more questions", expected: true, category: "reachout_closure" },
  { message: "Let me know if you need anything else", expected: true, category: "reachout_closure" },

  // Variations and paraphrases (should still detect)
  { message: "Can I assist with anything else today?", expected: true, category: "variation" },
  { message: "Do you have any other questions for me?", expected: true, category: "variation" },
  { message: "Is there anything else you'd like help with?", expected: true, category: "variation" },
  { message: "Would you like assistance with anything else?", expected: true, category: "variation" },

  // ===== TRUE NEGATIVES: Non-Closure Statements =====

  // Problem-solving statements
  { message: "Let me check that for you", expected: false, category: "problem_solving" },
  { message: "I'll look into this issue right away", expected: false, category: "problem_solving" },
  { message: "Let me transfer you to the billing department", expected: false, category: "problem_solving" },
  { message: "I'm going to reset your password now", expected: false, category: "problem_solving" },

  // Information requests
  { message: "Can you provide me with your account number?", expected: false, category: "information_request" },
  { message: "What seems to be the problem?", expected: false, category: "information_request" },
  { message: "Could you describe the issue in more detail?", expected: false, category: "information_request" },
  { message: "When did this problem start?", expected: false, category: "information_request" },

  // Acknowledgments
  { message: "I understand your concern", expected: false, category: "acknowledgment" },
  { message: "Thank you for that information", expected: false, category: "acknowledgment" },
  { message: "I see what you mean", expected: false, category: "acknowledgment" },
  { message: "Got it, let me help you with that", expected: false, category: "acknowledgment" },

  // Instructions/Solutions
  { message: "Here's how you can fix this issue", expected: false, category: "instruction" },
  { message: "Try clearing your browser cache", expected: false, category: "instruction" },
  { message: "You should receive an email within 24 hours", expected: false, category: "instruction" },
  { message: "Click on the settings icon in the top right", expected: false, category: "instruction" },

  // General conversation
  { message: "Hello, how can I help you today?", expected: false, category: "greeting" },
  { message: "I'm here to assist you", expected: false, category: "greeting" },
  { message: "Thanks for your patience", expected: false, category: "general" },
  { message: "I appreciate you waiting", expected: false, category: "general" },

  // ===== EDGE CASES =====

  // Short messages
  { message: "ok", expected: false, category: "edge_case_short" },
  { message: "thanks", expected: false, category: "edge_case_short" },
  { message: "bye", expected: false, category: "edge_case_short" },

  // Ambiguous cases (containing "help" but not closure)
  { message: "I need help with my order", expected: false, category: "edge_case_ambiguous" },
  { message: "Can you help me understand this charge?", expected: false, category: "edge_case_ambiguous" },
  { message: "Please help me fix this error", expected: false, category: "edge_case_ambiguous" },

  // Contains closure keywords but NOT actually closure
  { message: "I'll have a great day once this is fixed", expected: false, category: "edge_case_false_positive" },
  { message: "Can you take care of this issue?", expected: false, category: "edge_case_false_positive" },

  // Multi-sentence with closure at end (should detect)
  { message: "I've updated your account settings. Is there anything else I can help you with?", expected: true, category: "multi_sentence" },
  { message: "Your issue has been resolved. Have a great day!", expected: true, category: "multi_sentence" },
  { message: "I've processed your refund. Let me know if you need anything else.", expected: true, category: "multi_sentence" },
]

/**
 * Get dataset statistics
 */
export function getDatasetStats() {
  const total = closureTestDataset.length
  const truePositives = closureTestDataset.filter(d => d.expected === true).length
  const trueNegatives = closureTestDataset.filter(d => d.expected === false).length

  const categories = {}
  closureTestDataset.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1
  })

  return {
    total,
    truePositives,
    trueNegatives,
    categories,
    balance: (truePositives / total * 100).toFixed(1) + '%'
  }
}

/**
 * Get examples by category
 */
export function getByCategory(category) {
  return closureTestDataset.filter(item => item.category === category)
}
