'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if AI is configured
  useEffect(() => {
    fetch('/api/ai-chat/chat')
      .then(res => res.json())
      .then(data => setIsConfigured(data.configured))
      .catch(console.error)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)

    // Add user message optimistically
    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      role: 'USER',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const response = await fetch('/api/ai-chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage,
          workspace_id: 'demo-workspace-1', // Using demo workspace
          user_id: 'cmg8yu1ke0001c81pbqgcamxu', // Using real demo user ID
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Update conversation ID if it's a new conversation
      if (!conversationId) {
        setConversationId(data.conversation_id)
      }

      // Update messages with actual data
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        data.user_message,
        data.assistant_message,
      ])
    } catch (error: any) {
      console.error('Error sending message:', error)

      // Add error message
      const errorMsg: Message = {
        id: 'error-' + Date.now(),
        role: 'SYSTEM',
        content: error.message || 'Failed to send message. Please try again.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Show widget even if not configured, but with setup instructions

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-200 ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Ashley AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && !isConfigured && (
                  <div className="text-center text-gray-600 mt-4 p-4">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                    <h3 className="font-semibold text-lg mb-2">AI Chat Setup Required</h3>
                    <p className="text-sm mb-4">To enable intelligent AI responses, add an API key to your .env file:</p>

                    <div className="bg-white rounded-lg p-4 text-left space-y-3 border border-gray-200 text-xs">
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="font-semibold text-green-700 mb-1 flex items-center gap-2">
                          ⚡ Option 1: Groq (FREE & FASTEST!)
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">RECOMMENDED</span>
                        </p>
                        <code className="bg-white px-2 py-1 rounded block border">ASH_GROQ_API_KEY=gsk_...</code>
                        <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline text-xs mt-1 block">
                          Get FREE API key from console.groq.com →
                        </a>
                        <p className="text-xs text-green-700 mt-1">✅ 100% FREE • ⚡ Super Fast • 🧠 Llama 3.3 70B</p>
                      </div>

                      <div className="border-t pt-3">
                        <p className="font-semibold text-indigo-600 mb-1">Option 2: Anthropic Claude</p>
                        <code className="bg-gray-100 px-2 py-1 rounded block">ASH_ANTHROPIC_API_KEY=sk-ant-...</code>
                        <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline text-xs mt-1 block">
                          Get API key from console.anthropic.com →
                        </a>
                        <p className="text-xs text-gray-500 mt-1">💰 Paid - $5 minimum</p>
                      </div>

                      <div className="border-t pt-3">
                        <p className="font-semibold text-gray-600 mb-1">Option 3: OpenAI GPT</p>
                        <code className="bg-gray-100 px-2 py-1 rounded block">ASH_OPENAI_API_KEY=sk-proj-...</code>
                        <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline text-xs mt-1 block">
                          Get API key from platform.openai.com →
                        </a>
                        <p className="text-xs text-gray-500 mt-1">💰 Paid - $5 minimum</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">After adding the API key, restart your dev server.</p>
                  </div>
                )}

                {messages.length === 0 && isConfigured && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Start a conversation with Ashley AI</p>
                    <p className="text-xs mt-2">Ask about orders, production, finance, or anything else!</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'USER'
                          ? 'bg-indigo-600 text-white'
                          : message.role === 'SYSTEM'
                          ? 'bg-red-100 text-red-800 text-sm'
                          : 'bg-white text-gray-800 shadow-sm border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'USER' ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-lg p-3 shadow-sm border">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white rounded-b-lg">
                {!isConfigured ? (
                  <div className="text-center text-sm text-gray-500 py-2">
                    <p>Configure AI API key to start chatting</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 resize-none border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
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
  )
}
