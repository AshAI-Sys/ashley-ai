"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import HydrationSafeIcon from "@/components/hydration-safe-icon";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if AI is configured
  useEffect(() => {
    fetch("/api/ai-chat/chat")
      .then(res => res.json())
      .then(data => setIsConfigured(data.configured))
      .catch(console.error);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Add user message optimistically
    const tempUserMsg: Message = {
      id: "temp-" + Date.now(),
      role: "USER",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch("/api/ai-chat/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage,
          workspace_id: user?.workspaceId || "demo-workspace-1", // Use real workspace or fallback
          user_id: user?.id || "demo-user", // Use real user ID or fallback
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Update conversation ID if it's a new conversation
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Update messages with actual data
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        data.user_message,
        data.assistant_message,
      ]);
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMsg: Message = {
        id: "error-" + Date.now(),
        role: "SYSTEM",
        content: error.message || "Failed to send message. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show widget even if not configured, but with setup instructions

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-indigo-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-indigo-700"
          aria-label="Open AI Chat"
        >
          <HydrationSafeIcon Icon={MessageCircle} className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-lg bg-white shadow-2xl transition-all duration-200 ${
            isMinimized ? "h-14 w-80" : "h-[600px] w-96"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg border-b bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <HydrationSafeIcon Icon={MessageCircle} className="h-5 w-5" />
              <h3 className="font-semibold">Ashley AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded p-1 transition-colors hover:bg-white/20"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <HydrationSafeIcon Icon={Maximize2} className="h-4 w-4" />
                ) : (
                  <HydrationSafeIcon Icon={Minimize2} className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 transition-colors hover:bg-white/20"
                aria-label="Close chat"
              >
                <HydrationSafeIcon Icon={X} className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                {messages.length === 0 && !isConfigured && (
                  <div className="mt-4 p-4 text-center text-gray-600">
                    <HydrationSafeIcon Icon={MessageCircle} className="mx-auto mb-3 h-12 w-12 text-indigo-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      AI Chat Setup Required
                    </h3>
                    <p className="mb-4 text-sm">
                      To enable intelligent AI responses, add an API key to your
                      .env file:
                    </p>

                    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-left text-xs">
                      <div className="rounded border border-green-200 bg-green-50 p-3">
                        <p className="mb-1 flex items-center gap-2 font-semibold text-green-700">
                          ⚡ Option 1: Groq (FREE & FASTEST!)
                          <span className="rounded bg-green-600 px-2 py-0.5 text-xs text-white">
                            RECOMMENDED
                          </span>
                        </p>
                        <code className="block rounded border bg-white px-2 py-1">
                          ASH_GROQ_API_KEY=gsk_...
                        </code>
                        <a
                          href="https://console.groq.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs text-blue-600 hover:underline"
                        >
                          Get FREE API key from console.groq.com →
                        </a>
                        <p className="mt-1 text-xs text-green-700">
                          ✅ 100% FREE • ⚡ Super Fast • 🧠 Llama 3.3 70B
                        </p>
                      </div>

                      <div className="border-t pt-3">
                        <p className="mb-1 font-semibold text-indigo-600">
                          Option 2: Anthropic Claude
                        </p>
                        <code className="block rounded bg-gray-100 px-2 py-1">
                          ASH_ANTHROPIC_API_KEY=sk-ant-...
                        </code>
                        <a
                          href="https://console.anthropic.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs text-blue-600 hover:underline"
                        >
                          Get API key from console.anthropic.com →
                        </a>
                        <p className="mt-1 text-xs text-gray-500">
                          💰 Paid - $5 minimum
                        </p>
                      </div>

                      <div className="border-t pt-3">
                        <p className="mb-1 font-semibold text-gray-600">
                          Option 3: OpenAI GPT
                        </p>
                        <code className="block rounded bg-gray-100 px-2 py-1">
                          ASH_OPENAI_API_KEY=sk-proj-...
                        </code>
                        <a
                          href="https://platform.openai.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs text-blue-600 hover:underline"
                        >
                          Get API key from platform.openai.com →
                        </a>
                        <p className="mt-1 text-xs text-gray-500">
                          💰 Paid - $5 minimum
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                      After adding the API key, restart your dev server.
                    </p>
                  </div>
                )}

                {messages.length === 0 && isConfigured && (
                  <div className="mt-8 text-center text-gray-500">
                    <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                    <p className="text-sm">
                      Start a conversation with Ashley AI
                    </p>
                    <p className="mt-2 text-xs">
                      Ask about orders, production, finance, or anything else!
                    </p>
                  </div>
                )}

                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "USER"
                          ? "bg-indigo-600 text-white"
                          : message.role === "SYSTEM"
                            ? "bg-red-100 text-sm text-red-800"
                            : "border bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          message.role === "USER"
                            ? "text-indigo-200"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg border bg-white p-3 text-gray-800 shadow-sm">
                      <HydrationSafeIcon Icon={Loader2} className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="rounded-b-lg border-t bg-white p-4">
                {!isConfigured ? (
                  <div className="py-2 text-center text-sm text-gray-500">
                    <p>Configure AI API key to start chatting</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="max-h-32 flex-1 resize-none rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="rounded-lg bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <HydrationSafeIcon Icon={Loader2} className="h-5 w-5 animate-spin" />
                      ) : (
                        <HydrationSafeIcon Icon={Send} className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
