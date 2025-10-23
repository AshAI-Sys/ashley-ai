/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const prisma = db;

// Initialize AI clients (will use based on env config)
const anthropic = process.env.ASH_ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ASH_ANTHROPIC_API_KEY })
  : null;

const openai = process.env.ASH_OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.ASH_OPENAI_API_KEY })
  : null;

// Groq API (FREE & FAST!) - Uses OpenAI SDK with custom base URL
const groq = process.env.ASH_GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.ASH_GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

// Enhanced system prompt for Ashley AI assistant
const SYSTEM_PROMPT = `You are Ashley, an intelligent AI assistant for the ASH AI (Apparel Smart Hub) manufacturing ERP system.

## Your Expertise:
You are an expert in:
- **Manufacturing Operations**: Cutting, printing (silkscreen, sublimation, DTF, embroidery), sewing, finishing, packing
- **Order Management**: PO tracking, order intake, design approval workflows, production scheduling
- **Quality Control**: AQL sampling, defect tracking, CAPA management, inspection workflows
- **Production Planning**: Lay creation, bundle generation, efficiency calculations, resource optimization
- **Financial Operations**: Invoicing, payments, credit notes, expense management, cash flow analysis
- **HR & Payroll**: Employee management, attendance tracking, piece-rate calculations, productivity metrics
- **Maintenance**: Asset management, work orders, preventive maintenance scheduling
- **Client Relations**: Client portal, brand management, order approvals, delivery tracking

## Your Capabilities:
- Analyze real-time production data and provide insights
- Suggest optimizations for manufacturing efficiency
- Help troubleshoot production issues
- Calculate costs, timelines, and resource requirements
- Explain manufacturing processes and best practices
- Guide users through system features and workflows
- Identify bottlenecks and recommend solutions
- Provide data-driven recommendations

## Your Personality:
- Professional yet friendly and approachable
- Proactive in offering solutions and insights
- Clear and concise in explanations
- Patient with new users
- Data-driven and analytical
- Supportive of continuous improvement

## Response Guidelines:
- Give specific, actionable advice
- Use manufacturing terminology appropriately
- Reference actual data when discussing orders, clients, or production
- Offer step-by-step guidance for complex tasks
- Suggest best practices from apparel manufacturing industry
- Be proactive in identifying potential issues
- Provide context and explanations for your recommendations

When users ask about specific orders, clients, production data, or system features, provide detailed, accurate information based on the actual data available in the system.`;

// Function to get real-time business context
async function getBusinessContext(
  workspaceId: string,
  message: string
): Promise<string> {
  try {
    const contextParts: string[] = [];

    // Get recent orders summary
    const orders = await prisma.order.findMany({
      where: { workspace_id: workspaceId },
      include: {
        client: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    if (orders.length > 0) {
      contextParts.push(`\n## Recent Orders (Last 10):`);
      orders.forEach((order, idx) => {
        contextParts.push(
          `${idx + 1}. Order #${order.order_number} - ${order.client?.name || "N/A"} (${order.brand?.name || "N/A"}) - Status: ${order.status} - ₱${order.total_amount?.toLocaleString() || "0"}`
        );
      });
    }

    // Get clients summary
    const clients = await prisma.client.findMany({
      where: { workspace_id: workspaceId },
      include: {
        _count: {
          select: { orders: true, brands: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    if (clients.length > 0) {
      contextParts.push(`\n## Active Clients (Top 5):`);
      clients.forEach((client, idx) => {
        contextParts.push(
          `${idx + 1}. ${client.name} - ${client._count.brands} brands, ${client._count.orders} orders - Contact: ${client.email || "N/A"}`
        );
      });
    }

    // Get production statistics
    const orderStats = await prisma.order.groupBy({
      by: ["status"],
      where: { workspace_id: workspaceId },
      _count: true,
    });

    if (orderStats.length > 0) {
      contextParts.push(`\n## Production Overview:`);
      orderStats.forEach(stat => {
        contextParts.push(`- ${stat.status}: ${stat._count} orders`);
      });
    }

    // Get recent employees if HR query detected
    if (
      message.toLowerCase().includes("employee") ||
      message.toLowerCase().includes("staff") ||
      message.toLowerCase().includes("payroll")
    ) {
      const employees = await prisma.employee.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: "desc" },
        take: 5,
      });

      if (employees.length > 0) {
        contextParts.push(`\n## Recent Employees:`);
        employees.forEach((emp, idx) => {
          contextParts.push(
            `${idx + 1}. ${emp.first_name} ${emp.last_name} - ${emp.position || "N/A"} - ${emp.salary_type} (${emp.is_active ? "Active" : "Inactive"})`
          );
        });
      }
    }

    if (contextParts.length === 0) {
      return "\n## Current System Status:\nNo data available in the system yet. Ready to help you get started!";
    }
    return contextParts.join("\n");
  } catch (error) {
    console.error("Error getting business context:", error);
    return "\n## System Status:\nUnable to fetch current data, but ready to assist with general queries.";
  }
}

// POST /api/ai-chat/chat - Send a message and get AI response
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      conversation_id,
      message,
      workspace_id,
      user_id,
      use_stream = true,
    } = body;

    if (!message || !workspace_id) {
      return NextResponse.json(
        { error: "message and workspace_id are required" },
        { status: 400 }
      );
    }

    // Check if any AI provider is configured
    if (!anthropic && !openai && !groq) {
      return NextResponse.json(
        {
          error:
            "No AI provider configured. Please set ASH_GROQ_API_KEY (FREE), ASH_ANTHROPIC_API_KEY, or ASH_OPENAI_API_KEY in your .env file.",
          configuration_needed: true,
        },
        { status: 503 }
      );
    }

    // Ensure workspace exists (create if needed for demo mode)
    try {
      const workspaceExists = await prisma.workspace.findUnique({
        where: { id: workspace_id },
      });

      if (!workspaceExists) {
        console.log("Creating workspace:", workspace_id);
        // Create demo workspace if it doesn't exist
        await prisma.workspace.create({
          data: {
            id: workspace_id,
            name: "Demo Workspace",
            slug: workspace_id,
          },
        });
        console.log("Workspace created successfully");
      }
    } catch (error: any) {
      console.error("Error with workspace:", error.message);
      // If workspace creation fails, return error
      return NextResponse.json(
        { error: "Failed to setup workspace: " + error.message },
        { status: 500 }
      );
    }

    // Get or create conversation
    let conversationId = conversation_id;
    if (!conversationId) {
      try {
        // First verify workspace exists
        const workspace = await prisma.workspace.findFirst({
          where: { slug: workspace_id },
        });

        const actualWorkspaceId = workspace?.id || workspace_id;

        const newConversation = await prisma.aIChatConversation.create({
          data: {
            workspace_id: actualWorkspaceId,
            user_id: null, // Always null for demo mode to avoid foreign key issues
            title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
            context_type: "GENERAL",
          },
        });
        conversationId = newConversation.id;
      } catch (error: any) {
        console.error("Error creating conversation:", error.message, error);
        // Continue without conversation ID - one-off chat mode
        conversationId = "temp-" + Date.now();
      }
    }
    // Save user message (skip if temp conversation)
    let userMessage;
    try {
      if (!conversationId.startsWith("temp-")) {
        userMessage = await prisma.aIChatMessage.create({
          data: {
            conversation_id: conversationId,
            role: "USER",
            content: message,
            message_type: "TEXT",
          },
        });
      }
    } catch (error) {
      console.error("Error saving user message:", error);
      // Continue without saving - one-off mode
    }
    // Get conversation history (skip if temp conversation)
    let history: any[] = [];
    try {
      if (!conversationId.startsWith("temp-")) {
        history = await prisma.aIChatMessage.findMany({
          where: {
            conversation_id: conversationId,
          },
          orderBy: {
            created_at: "asc",
          },
          take: 20, // Last 20 messages for context
        });
      }
    } catch (error) {
      console.error("Error getting history:", error);
      // Continue without history
    }
    // Get real-time business context
    const businessContext = await getBusinessContext(workspace_id, message);

    // Prepare messages for AI with enhanced context
    const messages = history.map(msg => ({
      role: msg.role.toLowerCase() as "user" | "assistant",
      content: msg.content,
    }));

    // Add business context to the system for first message or when relevant
    const enhancedSystemPrompt = SYSTEM_PROMPT + businessContext;

    let assistantResponse = "";
    let modelUsed = "";

    // Priority: Groq (FREE & FAST) > Anthropic > OpenAI
    if (groq) {
      // Use Groq (FREE!) - Llama 3.3 70B with enhanced context
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // FREE model, super fast!
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      assistantResponse =
        response.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";
      modelUsed = "groq-llama-3.3-70b";
    } else if (anthropic) {
      // Use Anthropic Claude with enhanced context
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        system: enhancedSystemPrompt,
        messages: messages as any,
      });

      assistantResponse =
        response.content[0].type === "text"
          ? response.content[0].text
          : "Sorry, I could not generate a response.";
      modelUsed = "claude-3-5-sonnet";
    } else if (openai) {
      // Use OpenAI with enhanced context
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        max_tokens: 3000,
      });

      assistantResponse =
        response.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";
      modelUsed = "gpt-4-turbo";
    }

    // Save assistant message
    const assistantMessage = await prisma.aIChatMessage.create({
      data: {
        conversation_id: conversationId,
        role: "ASSISTANT",
        content: assistantResponse,
        message_type: "TEXT",
        metadata: JSON.stringify({
          model: modelUsed,
          provider: groq ? "groq" : anthropic ? "anthropic" : "openai",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Update conversation last_message_at
    await prisma.aIChatConversation.update({
      where: {
        id: conversationId,
      },
      data: {
        last_message_at: new Date(),
      },
    });

    return NextResponse.json({
      conversation_id: conversationId,
      user_message: userMessage,
      assistant_message: assistantMessage,
      response: assistantResponse,
    });
  } catch (error: any) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error.message,
      },
      { status: 500 }
    );
  }
});
// GET /api/ai-chat/chat - Check AI configuration status
export const GET = requireAuth(async (request: NextRequest, user) => {
  return NextResponse.json({
    configured: !!(groq || anthropic || openai),
    providers: {
      groq: !!groq,
      anthropic: !!anthropic,
      openai: !!openai,
    },
    active_provider: groq
      ? "groq (FREE!)"
      : anthropic
        ? "anthropic"
        : openai
          ? "openai"
          : null,
  });
