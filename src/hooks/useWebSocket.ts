import { useEffect, useState, useCallback } from 'react';
import { wsService } from '../services/wsService';

// Thin React wrapper over the singleton WebSocket client: exposes live connection
// status plus stable `send` / `subscribe` helpers.
export function useWebSocket() {
  const [connected, setConnected] = useState(wsService.connected);

  useEffect(() => {
    const offOpen = wsService.on('__open', () => setConnected(true));
    const offClose = wsService.on('__close', () => setConnected(false));
    return () => {
      offOpen();
      offClose();
    };
  }, []);

  const subscribe = useCallback(
    (type: string, handler: (payload: Record<string, unknown>) => void) =>
      wsService.on(type, handler),
    []
  );

  const send = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => wsService.send(type, payload),
    []
  );

  return { connected, subscribe, send };
}
