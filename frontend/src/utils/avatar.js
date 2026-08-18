/**
 * utils/avatar.js
 *
 * Pure helper functions for generating user avatar initials and colours.
 */

const AVATAR_COLORS = [
  '#6c63ff', // purple
  '#4ab3f4', // blue
  '#4caf7d', // green
  '#f5a623', // amber
  '#e05252', // red
  '#a855f7', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
];

/**
 * Derive a consistent avatar background colour from a username string.
 * @param {string} username
 * @returns {string} CSS colour value
 */
export function avatarColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Get up to two initials from a username.
 * @param {string} username
 * @returns {string} e.g. "AB", "J"
 */
export function avatarInitials(username) {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

/**
 * Format a joinedAt ISO string into a readable short form.
 * @param {string} isoString
 * @returns {string}
 */
export function formatJoinTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
