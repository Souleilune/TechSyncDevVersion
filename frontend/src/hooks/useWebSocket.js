import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useWebSocket = (onMessage) => {
    const { user } = useAuth();
    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (!user) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            reconnectAttempts.current = 0;
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket disconnected:', event.reason);
            
            // Attempt to reconnect if not intentionally closed
            if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current += 1;
                const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
                
                reconnectTimer.current = setTimeout(() => {
                    console.log(`Reconnecting WebSocket (attempt ${reconnectAttempts.current})`);
                    connect();
                }, delay);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    }, [user, onMessage]);

    const disconnect = useCallback(() => {
        if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
        }
        
        if (ws.current) {
            ws.current.close(1000, 'Component unmounting');
        }
    }, []);

    useEffect(() => {
        connect();
        return disconnect;
    }, [connect, disconnect]);

    return {
        isConnected: ws.current?.readyState === WebSocket.OPEN,
        reconnect: connect
    };
};