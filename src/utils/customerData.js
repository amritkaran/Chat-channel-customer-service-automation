const CUSTOMER_NAMES = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Jessica Martinez',
  'Robert Williams',
  'Amanda Taylor',
  'James Anderson',
  'Lisa Thompson',
  'Christopher Garcia',
  'Michelle Lee',
  'Daniel Brown',
  'Jennifer Davis',
  'Matthew Wilson',
  'Ashley Moore',
  'Joshua Jackson',
  'Samantha White',
  'Andrew Harris',
  'Rachel Martin',
  'Kevin Thompson'
]

const OPENING_STATEMENTS = {
  order: [
    "Hello! I need help with my recent order.",
    "Hi, I haven't received my order yet. Can you help?",
    "I placed an order last week but haven't gotten any updates.",
    "My order arrived but it's the wrong item.",
    "I need to track my order, can you assist?"
  ],
  payment: [
    "Hi! I have a question about a charge on my account.",
    "I was charged twice for my last purchase.",
    "My payment didn't go through but I was still charged.",
    "I need help with a refund for a recent transaction.",
    "There's an unauthorized charge on my account."
  ],
  account: [
    "Hi! I'm having trouble accessing my account.",
    "I need to update my account information.",
    "I can't remember my password, can you help?",
    "My account seems to be locked.",
    "I need to change my email address on file."
  ]
}

let usedNames = new Set()
let issueTypeIndex = 0

export function getRandomCustomerName() {
  const availableNames = CUSTOMER_NAMES.filter(name => !usedNames.has(name))

  if (availableNames.length === 0) {
    usedNames.clear()
    return CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)]
  }

  const name = availableNames[Math.floor(Math.random() * availableNames.length)]
  usedNames.add(name)
  return name
}

export function getOpeningStatement() {
  const issueTypes = ['order', 'payment', 'account']
  const issueType = issueTypes[issueTypeIndex % issueTypes.length]
  issueTypeIndex++

  const statements = OPENING_STATEMENTS[issueType]
  return statements[Math.floor(Math.random() * statements.length)]
}

export function resetCustomerData() {
  usedNames.clear()
  issueTypeIndex = 0
}
