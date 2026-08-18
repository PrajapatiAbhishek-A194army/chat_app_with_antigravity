'use strict';

/**
 * services/userStore.js
 *
 * In-memory temporary user store.
 *
 * IMPORTANT: This is NOT a database.
 * All data lives in a JavaScript Map on the server process.
 * Restarting the server clears every user immediately.
 *
 * Shape of a user record:
 *   {
 *     socketId : string   — unique socket identifier
 *     username : string   — display name chosen by the user
 *     joinedAt : string   — ISO 8601 timestamp
 *   }
 */

/** @type {Map<string, { socketId: string, username: string, joinedAt: string }>} */
const users = new Map();

// ── Validation constants ───────────────────────────────────────────────────────
const USERNAME_MIN = 2;
const USERNAME_MAX = 24;
const USERNAME_REGEX = /^[a-zA-Z0-9_\-. ]+$/;

/**
 * Validate a raw username string.
 * @param {string} raw
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
function validateUsername(raw) {
  if (typeof raw !== 'string') {
    return { valid: false, error: 'Username must be a string.' };
  }

  const sanitized = raw.trim();

  if (sanitized.length < USERNAME_MIN) {
    return { valid: false, error: `Username must be at least ${USERNAME_MIN} characters.` };
  }

  if (sanitized.length > USERNAME_MAX) {
    return { valid: false, error: `Username must be at most ${USERNAME_MAX} characters.` };
  }

  if (!USERNAME_REGEX.test(sanitized)) {
    return {
      valid: false,
      error: 'Username may only contain letters, numbers, spaces, hyphens, underscores, and dots.',
    };
  }

  return { valid: true, sanitized };
}

/**
 * Check if a username is already taken (case-insensitive).
 * @param {string} username — already sanitized
 * @returns {boolean}
 */
function isUsernameTaken(username) {
  const lower = username.toLowerCase();
  for (const user of users.values()) {
    if (user.username.toLowerCase() === lower) return true;
  }
  return false;
}

/**
 * Add a user to the store.
 * @param {string} socketId
 * @param {string} username — already sanitized and validated
 * @returns {{ socketId: string, username: string, joinedAt: string }}
 */
function addUser(socketId, username) {
  const user = { socketId, username, joinedAt: new Date().toISOString() };
  users.set(socketId, user);
  return user;
}

/**
 * Remove a user by socket ID.
 * @param {string} socketId
 * @returns {{ socketId: string, username: string, joinedAt: string } | undefined}
 */
function removeUser(socketId) {
  const user = users.get(socketId);
  users.delete(socketId);
  return user;
}

/**
 * Get a single user by socket ID.
 * @param {string} socketId
 * @returns {{ socketId: string, username: string, joinedAt: string } | undefined}
 */
function getUser(socketId) {
  return users.get(socketId);
}

/**
 * Get all current users as an array (safe copy).
 * @returns {Array<{ socketId: string, username: string, joinedAt: string }>}
 */
function getAllUsers() {
  return Array.from(users.values());
}

/**
 * Total number of connected users.
 * @returns {number}
 */
function getUserCount() {
  return users.size;
}

module.exports = {
  validateUsername,
  isUsernameTaken,
  addUser,
  removeUser,
  getUser,
  getAllUsers,
  getUserCount,
};
