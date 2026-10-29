import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom React hook for auto-reconnecting real-time WebSocket updates.
 * Listens for workflow execution events, node progress, and live terminal logs.
 * 
 * @param {Function} onEvent - Callback function receiving { event, data, timestamp }
 */
export function useRealtimeWorkflow(onEvent) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onEventRef = useRef(onEvent);

  // Keep latest onEvent callback without re-triggering socket recreation
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    // Deduce ws protocol (ws:// or wss://) based on window.location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || `${window.location.hostname}:5000`;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('⚡ [WebSocket] Connected to AgenticHire live stream');
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (onEventRef.current) {
            onEventRef.current(payload);
          }
        } catch {
          // Ignore non-json
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.warn('⚠️ [WebSocket] Connection error:', err);
        socket.close();
      };
    } catch (err) {
      console.warn('⚠️ [WebSocket] Failed to initialize socket:', err);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}

