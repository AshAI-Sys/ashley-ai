'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
  reconnectAttempts?: number
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
  reconnectAttempts = 10
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [reconnectCount, setReconnectCount] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('[WebSocket] Connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        setReconnectCount(0)
        onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          onMessage?.(message)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        setIsConnected(false)
        setConnectionStatus('disconnected')
        onClose?.()

        // Attempt reconnection
        if (reconnect && reconnectCount < reconnectAttempts) {
          console.log(`[WebSocket] Reconnecting in ${reconnectInterval}ms... (Attempt ${reconnectCount + 1}/${reconnectAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        setConnectionStatus('error')
        onError?.(error)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error)
      setConnectionStatus('error')
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectAttempts, reconnectInterval, reconnectCount])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      }
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Cannot send message - not connected')
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    reconnect: connect,
    disconnect
  }
}

// Hook for real-time dashboard updates
export function useDashboardWebSocket(onUpdate?: (data: any) => void) {
  // In production, this would connect to a real WebSocket server
  // For now, we'll simulate real-time updates using polling
  const [data, setData] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Simulate real-time updates every 5 seconds
    intervalRef.current = setInterval(() => {
      const simulatedData = {
        type: 'dashboard_update',
        data: {
          totalOrders: Math.floor(Math.random() * 100) + 50,
          ordersInProduction: Math.floor(Math.random() * 30) + 10,
          completedToday: Math.floor(Math.random() * 20) + 5,
          efficiency: Math.floor(Math.random() * 20) + 80,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      }

      setData(simulatedData.data)
      onUpdate?.(simulatedData.data)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onUpdate])

  return {
    data,
    isConnected: true, // Simulated
    connectionStatus: 'connected' as const
  }
}
