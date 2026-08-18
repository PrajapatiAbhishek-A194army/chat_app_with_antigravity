'use strict';

/**
 * sockets/index.js
 *
 * Registers all Socket.IO event handlers on the server.
 * Phase 5: typing indicators added (typing_start / typing_stop).
 *
 * All state is in-memory (userStore + messageStore + typingStore).
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

const {
  startTyping,
  stopTyping,
  removeTyping,
  getTypingUsers,
  isTyping,
} = require('../services/typingStore');

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
     * → chat_joined (socket)    { user, users, recentMessages, typingUsers }
     * → user_joined (broadcast) { user, users }
     * → chat_error  (socket)    { message }
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

      // Include current typing state so the joining user sees who is typing
      const recentMessages = getRecentMessages(50);
      const typingUsersSnapshot = getTypingUsers();

      socket.emit('chat_joined', { user, users, recentMessages, typingUsers: typingUsersSnapshot });
      socket.broadcast.emit('user_joined', { user, users });
    });

    /**
     * leave_chat — no payload
     * → user_left (broadcast all) { user, users }
     */
    socket.on('leave_chat', () => {
      // Stop typing first (clears the typing set and broadcasts if needed)
      const wasTyping = removeTyping(socket.id);
      if (wasTyping) {
        const user = getUser(socket.id);
        if (user) {
          io.emit('user_stopped_typing', {
            socketId: socket.id,
            username: user.username,
            typingUsers: getTypingUsers(),
          });
        }
      }

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
     * → new_message   (broadcast all) { id, socketId, username, text, timestamp }
     * → message_error (socket)        { message }
     */
    socket.on('send_message', ({ text } = {}) => {
      const user = getUser(socket.id);
      if (!user) {
        socket.emit('message_error', { message: 'You must join the chat before sending messages.' });
        return;
      }

      if (isRateLimited(socket.id)) {
        socket.emit('message_error', { message: 'You are sending messages too fast. Please slow down.' });
        return;
      }

      const { valid, error, sanitized } = validateMessage(text);
      if (!valid) {
        socket.emit('message_error', { message: error });
        return;
      }

      // Sending a message clears the typing state for this user
      const wasTyping = stopTyping(socket.id);
      if (wasTyping) {
        io.emit('user_stopped_typing', {
          socketId: socket.id,
          username: user.username,
          typingUsers: getTypingUsers(),
        });
      }

      const message = addMessage(socket.id, user.username, sanitized);

      console.log(
        `[chat] message  from="${user.username}"  len=${sanitized.length}  id=${message.id}`
      );

      io.emit('new_message', message);
    });

    // ────────────────────────────────────────────────────────────────────────
    // PHASE 5: Typing indicator events
    // ────────────────────────────────────────────────────────────────────────

    /**
     * typing_start — no payload
     * → user_typing (broadcast to others) { socketId, username, typingUsers }
     *
     * Ignored if: not a joined user, or already in typing set (debounce on client).
     * Server-side auto-expiry of 10 s prevents stuck indicators.
     */
    socket.on('typing_start', () => {
      const user = getUser(socket.id);
      if (!user) return; // must be joined

      // If already marked as typing, startTyping resets the auto-expire timer
      const wasAlreadyTyping = isTyping(socket.id);

      startTyping(socket.id, user.username, () => {
        // Auto-expiry callback — broadcast stop to all
        console.log(`[typing] auto-expire  username="${user.username}"  id=${socket.id}`);
        io.emit('user_stopped_typing', {
          socketId: socket.id,
          username: user.username,
          typingUsers: getTypingUsers(),
        });
      });

      // Only broadcast if they weren't already in the typing set
      if (!wasAlreadyTyping) {
        console.log(`[typing] start  username="${user.username}"  id=${socket.id}`);
        // Broadcast to everyone EXCEPT the sender (they don't see their own indicator)
        socket.broadcast.emit('user_typing', {
          socketId: socket.id,
          username: user.username,
          typingUsers: getTypingUsers(),
        });
      }
    });

    /**
     * typing_stop — no payload
     * → user_stopped_typing (broadcast to others) { socketId, username, typingUsers }
     */
    socket.on('typing_stop', () => {
      const user = getUser(socket.id);
      const wasTyping = stopTyping(socket.id);

      if (wasTyping && user) {
        console.log(`[typing] stop  username="${user.username}"  id=${socket.id}`);
        socket.broadcast.emit('user_stopped_typing', {
          socketId: socket.id,
          username: user.username,
          typingUsers: getTypingUsers(),
        });
      }
    });

    // ── Error guard ──────────────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[socket] error  id=${socket.id}  err=${err.message}`);
    });

    // ── Disconnect — auto-remove from all stores ─────────────────────────────
    socket.on('disconnect', (reason) => {
      // Clear typing state and notify others if they were typing
      const wasTyping = removeTyping(socket.id);
      const user = removeUser(socket.id);
      clearRateLimit(socket.id);

      if (user) {
        if (wasTyping) {
          io.emit('user_stopped_typing', {
            socketId: socket.id,
            username: user.username,
            typingUsers: getTypingUsers(),
          });
        }

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
