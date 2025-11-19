'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SSEEvent {
  type: 'heartbeat' | 'notification';
  unreadCount?: number;
  notification?: any;
}

interface UseNotificationSSEOptions {
  token: string | null;
  onNotification?: (notification: any) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function useNotificationSSE({ 
  token, 
  onNotification, 
  onUnreadCountChange 
}: UseNotificationSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectDelay = 30000; // 30 seconds max

  const getReconnectDelay = useCallback(() => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttemptsRef.current),
      maxReconnectDelay
    );
    return delay;
  }, []);

  const connect = useCallback(() => {
    if (!token || eventSourceRef.current) return;

    try {
      const url = `${API_URL}/notifications/stream`;
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      // Store token in a way that the backend can access it
      // Note: EventSource doesn't support custom headers, so we need to pass token via query param
      // This is a limitation of SSE - in production, consider using cookies for auth
      
      eventSource.onopen = () => {
        console.log('SSE connection established');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          
          if (data.type === 'heartbeat' && data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
            onUnreadCountChange?.(data.unreadCount);
          } else if (data.type === 'notification' && data.notification) {
            onNotification?.(data.notification);
            setUnreadCount(prev => prev + 1);
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect with exponential backoff
        const delay = getReconnectDelay();
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, delay);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      setIsConnected(false);
    }
  }, [token, onNotification, onUnreadCountChange, getReconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setUnreadCount(data.count || 0);
        onUnreadCountChange?.(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [token, onUnreadCountChange]);

  return {
    isConnected,
    unreadCount,
    disconnect,
    reconnect: connect,
  };
}
