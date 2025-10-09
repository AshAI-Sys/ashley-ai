import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@ash-ai/database'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const prisma = new PrismaClient()

// Initialize AI clients (will use based on env config)
const anthropic = process.env.ASH_ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ASH_ANTHROPIC_API_KEY })
  : null

const openai = process.env.ASH_OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.ASH_OPENAI_API_KEY })
  : null

// Groq API (FREE & FAST!) - Uses OpenAI SDK with custom base URL
const groq = process.env.ASH_GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.ASH_GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null

// System prompt for Ashley AI assistant
const SYSTEM_PROMPT = `You are Ashley, an intelligent AI assistant for the ASH AI manufacturing ERP system.

You help users with:
- Production planning and optimization
- Order management and tracking
- Quality control and inspections
- Financial operations and invoicing
- HR and payroll management
- Maintenance scheduling
- Client portal assistance
- Data analysis and reporting

You are friendly, professional, and knowledgeable about manufacturing operations, apparel production, and business management. Provide clear, actionable advice and help users navigate the system efficiently.

When users ask about specific orders, clients, or data, acknowledge that you can help them find and analyze that information. Be proactive in offering insights and suggestions.`

// POST /api/ai-chat/chat - Send a message and get AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, message, workspace_id, user_id, use_stream = true } = body

    if (!message || !workspace_id) {
      return NextResponse.json(
        { error: 'message and workspace_id are required' },
        { status: 400 }
      )
    }

    // Check if any AI provider is configured
    if (!anthropic && !openai && !groq) {
      return NextResponse.json(
        {
          error: 'No AI provider configured. Please set ASH_GROQ_API_KEY (FREE), ASH_ANTHROPIC_API_KEY, or ASH_OPENAI_API_KEY in your .env file.',
          configuration_needed: true
        },
        { status: 503 }
      )
    }

    // Get or create conversation
    let conversationId = conversation_id
    if (!conversationId) {
      const newConversation = await prisma.aIChatConversation.create({
        data: {
          workspace_id,
          user_id: user_id || null,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          context_type: 'GENERAL',
        },
      })
      conversationId = newConversation.id
    }

    // Save user message
    const userMessage = await prisma.aIChatMessage.create({
      data: {
        conversation_id: conversationId,
        role: 'USER',
        content: message,
        message_type: 'TEXT',
      },
    })

    // Get conversation history
    const history = await prisma.aIChatMessage.findMany({
      where: {
        conversation_id: conversationId,
      },
      orderBy: {
        created_at: 'asc',
      },
      take: 20, // Last 20 messages for context
    })

    // Prepare messages for AI
    const messages = history.map((msg) => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant',
      content: msg.content,
    }))

    let assistantResponse = ''
    let modelUsed = ''

    // Priority: Groq (FREE & FAST) > Anthropic > OpenAI
    if (groq) {
      // Use Groq (FREE!) - Llama 3.3 70B
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // FREE model, super fast!
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 2048,
        temperature: 0.7,
      })

      assistantResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      modelUsed = 'groq-llama-3.3-70b'
    } else if (anthropic) {
      // Use Anthropic Claude
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: messages as any,
      })

      assistantResponse = response.content[0].type === 'text'
        ? response.content[0].text
        : 'Sorry, I could not generate a response.'
      modelUsed = 'claude-3-5-sonnet'
    } else if (openai) {
      // Use OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 2048,
      })

      assistantResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      modelUsed = 'gpt-4-turbo'
    }

    // Save assistant message
    const assistantMessage = await prisma.aIChatMessage.create({
      data: {
        conversation_id: conversationId,
        role: 'ASSISTANT',
        content: assistantResponse,
        message_type: 'TEXT',
        metadata: JSON.stringify({
          model: modelUsed,
          provider: groq ? 'groq' : anthropic ? 'anthropic' : 'openai',
          timestamp: new Date().toISOString(),
        }),
      },
    })

    // Update conversation last_message_at
    await prisma.aIChatConversation.update({
      where: {
        id: conversationId,
      },
      data: {
        last_message_at: new Date(),
      },
    })

    return NextResponse.json({
      conversation_id: conversationId,
      user_message: userMessage,
      assistant_message: assistantMessage,
      response: assistantResponse,
    })
  } catch (error: any) {
    console.error('Error in AI chat:', error)
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET /api/ai-chat/chat - Check AI configuration status
export async function GET() {
  return NextResponse.json({
    configured: !!(groq || anthropic || openai),
    providers: {
      groq: !!groq,
      anthropic: !!anthropic,
      openai: !!openai,
    },
    active_provider: groq ? 'groq (FREE!)' : anthropic ? 'anthropic' : openai ? 'openai' : null,
  })
}
