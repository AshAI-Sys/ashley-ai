# AI Chat Assistant - Setup Guide

## Overview

Ashley AI now includes a **conversational AI chatbot** similar to ChatGPT that helps with manufacturing operations, production planning, orders, finance, HR, and more!

## Features

- 💬 **ChatGPT-style interface** - Talk naturally with the AI assistant
- 🎨 **Floating chat widget** - Appears on all pages in bottom-right corner
- 💾 **Conversation history** - Save and resume your conversations
- 🧠 **Context-aware** - AI understands your manufacturing business
- 🔄 **Multi-provider** - Works with Anthropic Claude or OpenAI GPT

## Setup Instructions

### Step 1: Get an API Key

Choose ONE of these providers:

#### Option A: Anthropic Claude (Recommended)

1. Visit: https://console.anthropic.com/
2. Sign up for an account
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

#### Option B: OpenAI GPT

1. Visit: https://platform.openai.com/
2. Sign up for an account
3. Go to "API keys" section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 2: Configure Your Environment

1. Open `.env` file in the project root
2. Add your API key:

```bash
# For Anthropic Claude:
ASH_ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here

# OR for OpenAI:
ASH_OPENAI_API_KEY=sk-your-actual-openai-key-here
```

3. Save the file

### Step 3: Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then start again:
pnpm --filter @ash/admin dev
```

### Step 4: Test the Chat

1. Open http://localhost:3001
2. Look for the purple chat button in the bottom-right corner
3. Click it to open the chat widget
4. Try asking:
   - "What can you help me with?"
   - "Show me how to create an order"
   - "Explain the production workflow"
   - "How do I manage employees?"

## API Endpoints

### Check Configuration Status

```bash
GET /api/ai-chat/chat
```

### Send a Chat Message

```bash
POST /api/ai-chat/chat
{
  "message": "Hello, how can you help?",
  "workspace_id": "your-workspace-id",
  "user_id": "your-user-id",
  "conversation_id": "optional-existing-conversation"
}
```

### Get All Conversations

```bash
GET /api/ai-chat/conversations?workspace_id=xxx
```

### Get Specific Conversation

```bash
GET /api/ai-chat/conversations/:id
```

## Database Tables

The AI Chat Assistant uses 4 new database tables:

1. **AIChatConversation** - Stores chat sessions
2. **AIChatMessage** - Individual messages (user/assistant)
3. **AIChatSuggestion** - AI-generated suggestions and insights
4. **AIChatKnowledge** - Knowledge base for learning

## Pricing Information

### Anthropic Claude

- **Claude 3.5 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Typical chat message: ~$0.01-0.05 per interaction
- More info: https://www.anthropic.com/pricing

### OpenAI GPT

- **GPT-4 Turbo**: ~$10 per 1M input tokens, ~$30 per 1M output tokens
- Typical chat message: ~$0.02-0.10 per interaction
- More info: https://openai.com/pricing

## Troubleshooting

### Chat button doesn't appear

- Check if API key is set in `.env`
- Restart the development server
- Check browser console for errors

### "No AI provider configured" error

- Make sure you set either `ASH_ANTHROPIC_API_KEY` or `ASH_OPENAI_API_KEY`
- Verify the key format (starts with `sk-ant-` or `sk-`)
- Restart the server after adding the key

### API rate limits exceeded

- Anthropic: 50 requests/min (free tier)
- OpenAI: Varies by account tier
- Consider implementing caching or rate limiting

## Security Notes

⚠️ **IMPORTANT**:

- Never commit your API keys to Git
- Keep `.env` file in `.gitignore`
- Use different keys for development and production
- Monitor your API usage on the provider dashboard
- Set up spending limits on your API account

## Future Enhancements

Planned features for the AI Chat Assistant:

- 🔊 Voice input/output
- 📊 Data visualization in chat
- 🔗 Direct actions (create orders, update status)
- 📁 File attachment support
- 🌐 Multi-language support
- 📱 Mobile app integration

---

**Need Help?**
Contact the development team or check the main [CLAUDE.md](CLAUDE.md) documentation.
