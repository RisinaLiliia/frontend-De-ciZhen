// src/hooks/usePresence.ts
'use client';

import * as React from 'react';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { buildPresenceWsUrl, pingPresence } from '@/lib/api/presence';
import { getAccessToken } from '@/lib/auth/token';

const PING_INTERVAL_MS = 60_000;
const ACTIVITY_THROTTLE_MS = 15_000;
const RECONNECT_DELAY_MS = 5_000;

export function usePresence() {
  const status = useAuthStatus();
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<number | null>(null);
  const lastPingRef = React.useRef(0);

  const doPing = React.useCallback(async () => {
    const now = Date.now();
    if (now - lastPingRef.current < ACTIVITY_THROTTLE_MS) return;
    lastPingRef.current = now;
    try {
      await pingPresence();
    } catch {
      // Ignore ping failures; next activity/interval will retry.
    }
  }, []);

  const closeSocket = React.useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connectSocket = React.useCallback(() => {
    if (status !== 'authenticated') return;
    if (!getAccessToken()) return;
    const wsUrl = buildPresenceWsUrl();
    if (!wsUrl) return;
    closeSocket();
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        void doPing();
      };
      ws.onclose = () => {
        wsRef.current = null;
        if (reconnectRef.current == null) {
          reconnectRef.current = window.setTimeout(() => {
            reconnectRef.current = null;
            connectSocket();
          }, RECONNECT_DELAY_MS);
        }
      };
      ws.onerror = () => {
        wsRef.current = null;
        if (reconnectRef.current == null) {
          reconnectRef.current = window.setTimeout(() => {
            reconnectRef.current = null;
            connectSocket();
          }, RECONNECT_DELAY_MS);
        }
      };
    } catch {
      if (reconnectRef.current == null) {
        reconnectRef.current = window.setTimeout(() => {
          reconnectRef.current = null;
          connectSocket();
        }, RECONNECT_DELAY_MS);
      }
    }
  }, [closeSocket, doPing, status]);

  React.useEffect(() => {
    if (status !== 'authenticated') {
      closeSocket();
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (reconnectRef.current != null) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      return;
    }

    connectSocket();
    if (intervalRef.current == null) {
      intervalRef.current = window.setInterval(() => {
        void pingPresence();
      }, PING_INTERVAL_MS);
    }

    const onActivity = () => {
      void doPing();
    };

    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity, { passive: true });
    window.addEventListener('scroll', onActivity, { passive: true });
    window.addEventListener('focus', onActivity);
    document.addEventListener('visibilitychange', onActivity);

    return () => {
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('scroll', onActivity);
      window.removeEventListener('focus', onActivity);
      document.removeEventListener('visibilitychange', onActivity);
      closeSocket();
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (reconnectRef.current != null) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };
  }, [closeSocket, connectSocket, doPing, status]);
}
