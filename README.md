# Customer Service Chat Bot Prototype

A customer service associate-facing chat interface with automatic conversation closure detection.

## Features

- Real-time chat interface for customer service associates
- AI-powered customer message simulation using LLM
- Automatic closure statement detection
- Auto-close timer (15-20 seconds after closure statement)
- Visual indicators for closure detection
- Mock responses when LLM is not configured

## Closure Statement Detection

The system uses **embedding-based semantic similarity** to detect closure statements intelligently:
- Uses OpenAI's text-embedding-3-small model
- Compares agent messages against 20+ closure statement examples
- Detects variations and paraphrases (similarity threshold: 0.75)
- Falls back to keyword matching if embeddings fail

Example closure statements detected:
- "Hope I was able to help you"
- "Is there anything else I can help you with?"
- "Do you need any other help?"
- "Have a great day"
- And semantically similar variations...

### Auto-Closure Behavior

When a closure statement is detected:
1. **Countdown Timer** - A reverse countdown (60s) appears in the header
2. **Pause on Typing** - Timer automatically pauses when CSA starts typing
3. **Revert Button** - CSA can cancel auto-closure with the "✕ Cancel" button
4. **Re-trigger** - Sending another closure statement resets the timer and message count
5. **4-Message Rule** - If 4+ messages (agent + customer combined) are exchanged after closure, timer automatically cancels (assumes new issue)

Example of 4-message rule:
- Agent: "Anything else I can help with?" (Closure detected, timer starts)
- Customer: "Actually yes..." (Count: 1)
- Agent: "Sure, what's the issue?" (Count: 2)
- Customer: "My payment failed" (Count: 3)
- Agent: "Let me check that" (Count: 4 - Timer cancelled, indicator removed)

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure LLM for customer message generation:
   - Copy `.env.example` to `.env`
   - Add your API key and configure the model

```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

### Basic Flow
1. The chat starts with an initial customer message
2. Type your response as a customer service associate
3. The system generates customer responses automatically using GPT

### Closure Detection Flow
4. When you type a closure statement (e.g., "Is there anything else I can help with?"):
   - Orange banner appears in header with countdown timer
   - Timer shows remaining seconds (e.g., "Auto-closing in 18s")
5. While typing your next message:
   - Timer pauses and shows "⏸ Paused - Typing..."
   - Timer resumes when you stop typing
6. Options during countdown:
   - **Cancel**: Click "✕ Cancel" button to cancel auto-closure
   - **Continue**: Send non-closure message to cancel auto-closure
   - **Re-trigger**: Send another closure statement to reset timer
7. After countdown reaches 0, contact automatically closes
8. Click "Start New Contact" to begin a new conversation

## LLM Configuration

### OpenAI
```env
VITE_LLM_API_KEY=sk-...
VITE_LLM_MODEL=gpt-3.5-turbo
VITE_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
```

### Anthropic Claude
```env
VITE_LLM_API_KEY=sk-ant-...
VITE_LLM_MODEL=claude-3-haiku-20240307
VITE_LLM_ENDPOINT=https://api.anthropic.com/v1/messages
```

### No LLM (Mock Responses)
If no API key is configured, the system uses predefined mock responses for testing.

## Future Enhancements

- Multi-chat support (handle 3+ chats in parallel)
- Customizable closure patterns
- Analytics and metrics
- Integration with real customer service platforms
