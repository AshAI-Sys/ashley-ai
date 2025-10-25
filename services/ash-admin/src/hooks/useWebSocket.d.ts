interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
}
interface UseWebSocketOptions {
    url: string;
    onMessage?: (message: WebSocketMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    reconnect?: boolean;
    reconnectInterval?: number;
    reconnectAttempts?: number;
}
export declare function useWebSocket({ url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, reconnectAttempts, }: UseWebSocketOptions): {
    isConnected: boolean;
    connectionStatus: "error" | "connecting" | "connected" | "disconnected";
    lastMessage: WebSocketMessage;
    sendMessage: (type: string, data: any) => void;
    reconnect: () => void;
    disconnect: () => void;
};
export declare function useDashboardWebSocket(onUpdate?: (data: any) => void): {
    data: any;
    isConnected: boolean;
    connectionStatus: "connected";
};
export {};
