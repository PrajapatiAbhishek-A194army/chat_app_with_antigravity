'use strict';

/**
 * sockets/index.js
 *
 * Registers all Socket.IO event handlers on the server.
 * Phase 4: real-time messaging added (send_message / new_message).
 *
 * All state is in-memory (userStore + messageStore).
 * No database is used. Restarting clears everything.
 */

const {
  validateUsername,
  isUsernameTaken,
  addUser,
  removeUser,
  getUser,
  getAllUsers,
} = require('../services/userStore');

const {
  validateMessage,
  isRateLimited,
  addMessage,
  getRecentMessages,
  clearRateLimit,
} = require('../services/messageStore');

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
    // PHASE 3: User session events
    // ────────────────────────────────────────────────────────────────────────

    /**
     * join_chat — { username }
     * → chat_joined (socket)  { user, users, recentMessages }
     * → user_joined (broadcast) { user, users }
     * → chat_error (socket on failure) { message }
     */
    socket.on('join_chat', ({ username } = {}) => {
      if (getUser(socket.id)) {
        socket.emit('chat_error', { message: 'You are already in the chat.' });
        return;
      }

      const { valid, error, sanitized } = validateUsername(username);
      if (!valid) {
        socket.emit('chat_error', { message: error });
        return;
      }

      if (isUsernameTaken(sanitized)) {
        socket.emit('chat_error', {
          message: `Username "${sanitized}" is already taken. Please choose another.`,
        });
        return;
      }

      const user = addUser(socket.id, sanitized);
      const users = getAllUsers();

      console.log(`[chat] join  username="${sanitized}"  id=${socket.id}  total=${users.length}`);

      // Send recent messages to the joining user so they see context
      const recentMessages = getRecentMessages(50);

      socket.emit('chat_joined', { user, users, recentMessages });
      socket.broadcast.emit('user_joined', { user, users });
    });

    /**
     * leave_chat — no payload
     * → user_left (broadcast all) { user, users }
     */
    socket.on('leave_chat', () => {
      const user = removeUser(socket.id);
      if (!user) return;

      clearRateLimit(socket.id);
      const users = getAllUsers();
      console.log(`[chat] leave  username="${user.username}"  id=${socket.id}  total=${users.length}`);

      io.emit('user_left', { user, users });
    });

    // ────────────────────────────────────────────────────────────────────────
    // PHASE 4: Messaging events
    // ────────────────────────────────────────────────────────────────────────

    /**
     * send_message — { text: string }
     * → new_message (broadcast all) { id, socketId, username, text, timestamp }
     * → message_error (socket on failure) { message }
     */
    socket.on('send_message', ({ text } = {}) => {
      // Must be a joined user
      const user = getUser(socket.id);
      if (!user) {
        socket.emit('message_error', { message: 'You must join the chat before sending messages.' });
        return;
      }

      // Rate limiting
      if (isRateLimited(socket.id)) {
        socket.emit('message_error', { message: 'You are sending messages too fast. Please slow down.' });
        return;
      }

      // Validate message text
      const { valid, error, sanitized } = validateMessage(text);
      if (!valid) {
        socket.emit('message_error', { message: error });
        return;
      }

      // Store and broadcast
      const message = addMessage(socket.id, user.username, sanitized);

      console.log(
        `[chat] message  from="${user.username}"  len=${sanitized.length}  id=${message.id}`
      );

      // Broadcast to everyone including the sender
      io.emit('new_message', message);
    });

    // ── Error guard ──────────────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[socket] error  id=${socket.id}  err=${err.message}`);
    });

    // ── Disconnect — auto-remove from user store ─────────────────────────────
    socket.on('disconnect', (reason) => {
      const user = removeUser(socket.id);
      clearRateLimit(socket.id);

      if (user) {
        const users = getAllUsers();
        console.log(
          `[chat] disconnect  username="${user.username}"  id=${socket.id}  reason=${reason}  total=${users.length}`
        );
        io.emit('user_left', { user, users });
      } else {
        console.log(`[socket] - disconnected (no session)  id=${socket.id}  reason=${reason}`);
      }
    });
  });
}

module.exports = { registerSocketHandlers };
