/**
 * hooks/useMessages.js
 *
 * Manages the messages list and send_message event.
 *
 * Responsibilities:
 * - Stores messages received via new_message
 * - Populates initial messages from chat_joined.recentMessages
 * - Exposes sendMessage() — validates client-side before emitting
 * - Exposes messageError state from server-side message_error events
 * - Cleans up listeners on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../services/socket';

const MESSAGE_MAX_LENGTH = 500;

/**
 * @typedef {{ id: string, socketId: string, username: string, text: string, timestamp: string }} Message
 */

/**
 * @returns {{
 *   messages: Message[],
 *   messageError: string | null,
 *   clearMessageError: () => void,
 *   sendMessage: (text: string) => void,
 * }}
 */
export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [messageError, setMessageError] = useState(null);
  const listenersRegistered = useRef(false);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      // Prevent duplicate IDs (e.g. from React StrictMode double-invocation)
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const registerListeners = useCallback(() => {
    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

    // Load recent messages when joining
    socket.on('chat_joined', ({ recentMessages }) => {
      if (Array.isArray(recentMessages) && recentMessages.length > 0) {
        setMessages(recentMessages);
      }
    });

    // Real-time incoming message
    socket.on('new_message', (message) => {
      addMessage(message);
    });

    // Server-side send error
    socket.on('message_error', ({ message }) => {
      setMessageError(message);
    });
  }, [addMessage]);

  const removeListeners = useCallback(() => {
    // Only remove the handlers we registered here
    socket.off('new_message');
    socket.off('message_error');
    // Note: chat_joined is also used by useChat — use a named handler approach
    listenersRegistered.current = false;
  }, []);

  useEffect(() => {
    registerListeners();
    return () => removeListeners();
  }, [registerListeners, removeListeners]);

  /**
   * Client-side validate then emit send_message.
   * @param {string} text
   */
  const sendMessage = useCallback((text) => {
    const trimmed = (text || '').trim();

    if (!trimmed) {
      setMessageError('Message cannot be empty.');
      return;
    }

    if (trimmed.length > MESSAGE_MAX_LENGTH) {
      setMessageError(`Message is too long (max ${MESSAGE_MAX_LENGTH} characters).`);
      return;
    }

    setMessageError(null);
    socket.emit('send_message', { text: trimmed });
  }, []);

  const clearMessageError = useCallback(() => setMessageError(null), []);

  return { messages, messageError, clearMessageError, sendMessage };
}
