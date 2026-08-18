'use strict';

/**
 * services/messageStore.js
 *
 * In-memory temporary message store.
 *
 * IMPORTANT: This is NOT a database.
 * All messages live in a JavaScript Array on the server process.
 * Restarting the server clears every message immediately.
 *
 * Message shape:
 *   {
 *     id        : string   — unique message ID (timestamp + random)
 *     socketId  : string   — sender socket ID
 *     username  : string   — sender display name
 *     text      : string   — sanitized message content
 *     timestamp : string   — ISO 8601
 *   }
 */

/** @type {Array<{ id: string, socketId: string, username: string, text: string, timestamp: string }>} */
const messages = [];

// ── Validation constants ───────────────────────────────────────────────────────
const MESSAGE_MAX_LENGTH = 500;
const MESSAGE_RATE_LIMIT_MS = 500; // minimum ms between messages per socket

/** @type {Map<string, number>} socketId → last message timestamp */
const lastMessageTime = new Map();

/**
 * Validate and sanitize a raw message text.
 * @param {string} raw
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
function validateMessage(raw) {
  if (typeof raw !== 'string') {
    return { valid: false, error: 'Message must be a string.' };
  }

  const sanitized = raw.trim();

  if (sanitized.length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }

  if (sanitized.length > MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Message is too long (max ${MESSAGE_MAX_LENGTH} characters).`,
    };
  }

  return { valid: true, sanitized };
}

/**
 * Check if a socket is sending messages too rapidly.
 * @param {string} socketId
 * @returns {boolean}
 */
function isRateLimited(socketId) {
  const last = lastMessageTime.get(socketId) || 0;
  return Date.now() - last < MESSAGE_RATE_LIMIT_MS;
}

/**
 * Generate a unique message ID.
 * @returns {string}
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Add a message to the temporary store.
 * Keeps at most 200 messages in memory (oldest discarded automatically).
 *
 * @param {string} socketId
 * @param {string} username
 * @param {string} text — already validated and sanitized
 * @returns {{ id: string, socketId: string, username: string, text: string, timestamp: string }}
 */
function addMessage(socketId, username, text) {
  lastMessageTime.set(socketId, Date.now());

  const message = {
    id: generateId(),
    socketId,
    username,
    text,
    timestamp: new Date().toISOString(),
  };

  messages.push(message);

  // Prevent unbounded memory growth — keep latest 200 messages
  if (messages.length > 200) {
    messages.shift();
  }

  return message;
}

/**
 * Get recent messages (safe copy).
 * @param {number} [limit=50]
 * @returns {Array}
 */
function getRecentMessages(limit = 50) {
  return messages.slice(-limit);
}

/**
 * Remove rate-limit record when a socket disconnects.
 * @param {string} socketId
 */
function clearRateLimit(socketId) {
  lastMessageTime.delete(socketId);
}

module.exports = {
  validateMessage,
  isRateLimited,
  addMessage,
  getRecentMessages,
  clearRateLimit,
};
