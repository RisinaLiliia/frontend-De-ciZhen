// src/hooks/usePresence.ts
'use client';

import * as React from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { getPresenceSocketUrl, pingPresence } from '@/lib/api/presence';
import { getAccessToken } from '@/lib/auth/token';

const PING_INTERVAL_MS = 60_000;
const ACTIVITY_THROTTLE_MS = 15_000;
const RECONNECT_DELAY_MS = 5_000;

export function usePresence() {
  const status = useAuthStatus();
  const socketRef = React.useRef<Socket | null>(null);
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
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const connectSocket = React.useCallback(() => {
    if (status !== 'authenticated') return;
    const token = getAccessToken();
    if (!token) return;
    const socketUrl = getPresenceSocketUrl();
    if (!socketUrl) return;
    closeSocket();
    const socket = io(socketUrl, {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY_MS,
    });
    socket.on('connect', () => {
      void doPing();
    });
    socketRef.current = socket;
  }, [closeSocket, doPing, status]);

  React.useEffect(() => {
    if (status !== 'authenticated') {
      closeSocket();
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
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
    };
  }, [closeSocket, connectSocket, doPing, status]);
}
