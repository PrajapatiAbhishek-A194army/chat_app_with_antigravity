/**
 * hooks/useSocket.js
 *
 * Custom hook that manages the Socket.IO connection lifecycle.
 *
 * Responsibilities:
 * - Connects to the server when `shouldConnect` becomes true.
 * - Tracks connection state: 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'
 * - Cleans up ALL listeners when the component unmounts (prevents duplicate listeners).
 * - Exposes the raw socket so callers can emit events.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '../services/socket';

/**
 * @typedef {'idle'|'connecting'|'connected'|'error'|'disconnected'} SocketStatus
 */

/**
 * @returns {{
 *   socket: import('socket.io-client').Socket,
 *   status: SocketStatus,
 *   socketId: string|null,
 *   serverTime: string|null,
 *   error: string|null,
 *   connect: () => void,
 *   disconnect: () => void,
 *   sendPing: () => void,
 *   lastPong: object|null,
 * }}
 */
export function useSocket() {
  const [status, setStatus] = useState(/** @type {SocketStatus} */ ('idle'));
  const [socketId, setSocketId] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [error, setError] = useState(null);
  const [lastPong, setLastPong] = useState(null);

  // Ref to avoid stale closures in listeners
  const listenersRegistered = useRef(false);

  const registerListeners = useCallback(() => {
    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

    // ── Lifecycle events ───────────────────────────────────────────────────
    socket.on('connect', () => {
      setStatus('connected');
      setError(null);
      setSocketId(socket.id);
    });

    socket.on('disconnect', (reason) => {
      setStatus('disconnected');
      setSocketId(null);
      // If the server disconnected us, try to reconnect automatically
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      setStatus('error');
      setError(err.message || 'Connection failed');
    });

    socket.io.on('reconnect_attempt', () => {
      setStatus('connecting');
    });

    socket.io.on('reconnect_failed', () => {
      setStatus('error');
      setError('Reconnection failed. Please refresh the page.');
    });

    socket.io.on('reconnect', () => {
      setStatus('connected');
      setError(null);
    });

    // ── Server-emitted events ─────────────────────────────────────────────
    socket.on('connection_ack', ({ socketId: id, serverTime: st }) => {
      setSocketId(id);
      setServerTime(st);
    });

    socket.on('pong_client', (payload) => {
      setLastPong(payload);
    });
  }, []);

  const removeListeners = useCallback(() => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('pong_client');
    socket.off('connection_ack');
    socket.io.off('reconnect_attempt');
    socket.io.off('reconnect_failed');
    socket.io.off('reconnect');
    listenersRegistered.current = false;
  }, []);

  // Register listeners once on mount, clean up on unmount
  useEffect(() => {
    registerListeners();
    return () => {
      removeListeners();
    };
  }, [registerListeners, removeListeners]);

  const connect = useCallback(() => {
    if (!socket.connected) {
      setStatus('connecting');
      setError(null);
      socket.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    socket.disconnect();
    setStatus('idle');
    setSocketId(null);
    setServerTime(null);
  }, []);

  /**
   * Phase-2 test: emit ping_server and wait for pong_client response.
   */
  const sendPing = useCallback(() => {
    if (!socket.connected) return;
    socket.emit('ping_server', { clientTime: new Date().toISOString() }, (response) => {
      // Callback-style acknowledgement
      setLastPong(response);
    });
  }, []);

  return {
    socket,
    status,
    socketId,
    serverTime,
    error,
    connect,
    disconnect,
    sendPing,
    lastPong,
  };
}
