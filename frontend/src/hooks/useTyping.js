/**
 * hooks/useTyping.js
 *
 * Manages typing indicator state.
 *
 * Responsibilities:
 * - Tracks which OTHER users are currently typing
 * - Exposes notifyTyping() — call on every keystroke
 *   → emits typing_start once per burst
 *   → emits typing_stop after 1.5 s of silence (client-side debounce)
 * - Listens for user_typing / user_stopped_typing from server
 * - Cleans up listeners on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../services/socket';

const STOP_DELAY_MS = 1500; // ms of silence before emitting typing_stop

/**
 * @returns {{
 *   typingUsers: Array<{ socketId: string, username: string }>,
 *   notifyTyping: () => void,
 *   stopTypingNow: () => void,
 * }}
 */
export function useTyping() {
  const [typingUsers, setTypingUsers] = useState([]);

  const isTypingRef = useRef(false);      // tracks whether we've sent typing_start
  const stopTimerRef = useRef(null);      // debounce timer handle
  const listenersRegistered = useRef(false);

  // ── Receive typing snapshot from chat_joined (late-join) ──────────────────
  useEffect(() => {
    const onChatJoined = ({ typingUsers: snapshot }) => {
      if (Array.isArray(snapshot)) setTypingUsers(snapshot);
    };
    socket.on('chat_joined', onChatJoined);
    return () => socket.off('chat_joined', onChatJoined);
  }, []);

  // ── Server → client typing events ─────────────────────────────────────────
  useEffect(() => {
    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

    socket.on('user_typing', ({ typingUsers: list }) => {
      setTypingUsers(Array.isArray(list) ? list : []);
    });

    socket.on('user_stopped_typing', ({ typingUsers: list }) => {
      setTypingUsers(Array.isArray(list) ? list : []);
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      listenersRegistered.current = false;
    };
  }, []);

  /**
   * Call this on every keypress in the message composer.
   * Emits typing_start once per burst; resets the stop debounce timer.
   */
  const notifyTyping = useCallback(() => {
    // Emit start only on the leading edge (first keypress of a burst)
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start');
    }

    // Reset the stop debounce timer
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit('typing_stop');
      }
    }, STOP_DELAY_MS);
  }, []);

  /**
   * Force an immediate typing_stop (e.g. after the user sends a message).
   */
  const stopTypingNow = useCallback(() => {
    clearTimeout(stopTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing_stop');
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(stopTimerRef.current);
    };
  }, []);

  return { typingUsers, notifyTyping, stopTypingNow };
}
