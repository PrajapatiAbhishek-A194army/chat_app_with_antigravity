'use strict';

/**
 * services/typingStore.js
 *
 * In-memory temporary typing state tracker.
 *
 * IMPORTANT: This is NOT a database.
 * All state lives in memory. Restarting the server clears everything.
 *
 * Tracks which users are currently typing, with a server-side
 * auto-expiry safety net (10 seconds) so typing indicators can
 * never get permanently stuck if a client fails to send typing_stop.
 *
 * Shape:
 *   typingUsers   : Map<socketId, { socketId, username, timer }>
 */

const AUTO_EXPIRE_MS = 10_000; // 10 seconds safety timeout

/** @type {Map<string, { socketId: string, username: string, timer: NodeJS.Timeout }>} */
const typingUsers = new Map();

/**
 * Mark a user as typing.
 * Resets the auto-expiry timer if they were already typing.
 *
 * @param {string} socketId
 * @param {string} username
 * @param {() => void} onExpire — called when the auto-timer fires
 */
function startTyping(socketId, username, onExpire) {
  // Clear any existing timer for this socket
  const existing = typingUsers.get(socketId);
  if (existing) clearTimeout(existing.timer);

  const timer = setTimeout(() => {
    // Auto-expire: remove and notify via callback
    typingUsers.delete(socketId);
    onExpire();
  }, AUTO_EXPIRE_MS);

  typingUsers.set(socketId, { socketId, username, timer });
}

/**
 * Mark a user as no longer typing.
 * @param {string} socketId
 * @returns {boolean} true if they were actually in the typing set
 */
function stopTyping(socketId) {
  const entry = typingUsers.get(socketId);
  if (!entry) return false;
  clearTimeout(entry.timer);
  typingUsers.delete(socketId);
  return true;
}

/**
 * Remove a user completely (on disconnect / leave).
 * @param {string} socketId
 * @returns {boolean} true if they were in the typing set
 */
function removeTyping(socketId) {
  return stopTyping(socketId);
}

/**
 * Get all currently-typing users as a safe copy (without timer refs).
 * @returns {Array<{ socketId: string, username: string }>}
 */
function getTypingUsers() {
  return Array.from(typingUsers.values()).map(({ socketId, username }) => ({
    socketId,
    username,
  }));
}

/**
 * Check if a user is currently in the typing set.
 * @param {string} socketId
 * @returns {boolean}
 */
function isTyping(socketId) {
  return typingUsers.has(socketId);
}

module.exports = {
  startTyping,
  stopTyping,
  removeTyping,
  getTypingUsers,
  isTyping,
};
