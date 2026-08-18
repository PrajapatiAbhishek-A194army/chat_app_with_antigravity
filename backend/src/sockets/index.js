'use strict';

/**
 * sockets/index.js
 *
 * Registers all Socket.IO event handlers on the server.
 * Phase 3: temporary user sessions — join, leave, disconnect, user list.
 *
 * In-memory state is managed by userStore; no database is used.
 * Restarting the process clears all state automatically.
 */

const {
  validateUsername,
  isUsernameTaken,
  addUser,
  removeUser,
  getUser,
  getAllUsers,
} = require('../services/userStore');

/**
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] + connected   id=${socket.id}`);

    // ── Acknowledge the raw connection ───────────────────────────────────────
    socket.emit('connection_ack', {
      socketId: socket.id,
      serverTime: new Date().toISOString(),
      message: 'Connected to ChatNow server',
    });

    // ── Phase-2 test event (kept for compatibility) ──────────────────────────
    socket.on('ping_server', (payload, callback) => {
      const response = {
        echo: payload,
        serverTime: new Date().toISOString(),
        socketId: socket.id,
      };
      if (typeof callback === 'function') {
        callback(response);
      } else {
        socket.emit('pong_client', response);
      }
    });

    // ────────────────────────────────────────────────────────────────────────
    // PHASE 3 EVENTS
    // ────────────────────────────────────────────────────────────────────────

    /**
     * join_chat
     * Client sends: { username: string }
     * Server responds:
     *   → chat_joined  (to this socket)  { user, users }
     *   → user_joined  (broadcast all)   { user, users }
     *   → chat_error   (to this socket on failure) { message }
     */
    socket.on('join_chat', ({ username } = {}) => {
      // Guard: already in chat
      if (getUser(socket.id)) {
        socket.emit('chat_error', { message: 'You are already in the chat.' });
        return;
      }

      // Validate username
      const { valid, error, sanitized } = validateUsername(username);
      if (!valid) {
        socket.emit('chat_error', { message: error });
        return;
      }

      // Duplicate username check
      if (isUsernameTaken(sanitized)) {
        socket.emit('chat_error', {
          message: `Username "${sanitized}" is already taken. Please choose another.`,
        });
        return;
      }

      // Register user in temporary store
      const user = addUser(socket.id, sanitized);
      const users = getAllUsers();

      console.log(`[chat] join  username="${sanitized}"  id=${socket.id}  total=${users.length}`);

      // Tell the joining socket they are in
      socket.emit('chat_joined', { user, users });

      // Broadcast join notification to everyone else
      socket.broadcast.emit('user_joined', { user, users });
    });

    /**
     * leave_chat
     * Client sends: (no payload)
     * Server responds:
     *   → user_left   (broadcast all)   { user, users }
     */
    socket.on('leave_chat', () => {
      const user = removeUser(socket.id);
      if (!user) return; // wasn't in chat

      const users = getAllUsers();
      console.log(`[chat] leave  username="${user.username}"  id=${socket.id}  total=${users.length}`);

      io.emit('user_left', { user, users });
    });

    // ── Error guard ──────────────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[socket] error  id=${socket.id}  err=${err.message}`);
    });

    // ── Disconnect — auto-remove from user store ─────────────────────────────
    socket.on('disconnect', (reason) => {
      const user = removeUser(socket.id);

      if (user) {
        const users = getAllUsers();
        console.log(
          `[chat] disconnect  username="${user.username}"  id=${socket.id}  reason=${reason}  total=${users.length}`
        );
        // Notify remaining users
        io.emit('user_left', { user, users });
      } else {
        console.log(`[socket] - disconnected (no session)  id=${socket.id}  reason=${reason}`);
      }
    });
  });
}

module.exports = { registerSocketHandlers };
