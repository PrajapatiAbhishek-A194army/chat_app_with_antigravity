/**
 * services/socket.js
 *
 * Singleton Socket.IO client.
 *
 * Rules:
 * - One socket instance for the entire app lifetime.
 * - autoConnect: false  →  we connect deliberately (e.g. after user enters a username).
 * - Callers import { socket } and call socket.connect() / socket.disconnect().
 * - Do NOT create additional socket instances elsewhere in the app.
 */

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SERVER_URL, {
  autoConnect: false,          // connect only when explicitly requested
  reconnection: true,          // auto-reconnect on drop
  reconnectionAttempts: 5,     // give up after 5 failed attempts
  reconnectionDelay: 1000,     // 1 s initial delay
  reconnectionDelayMax: 5000,  // cap at 5 s
  timeout: 10000,              // connection timeout
});

export default socket;
