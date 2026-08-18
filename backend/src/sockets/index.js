'use strict';

/**
 * socket-handlers/index.js
 *
 * Registers all Socket.IO event handlers on the server.
 * Phase 2: connection lifecycle + bidirectional ping/pong test event.
 *
 * In-memory state lives here; this module is intentionally NOT a database.
 * Restarting the process clears everything automatically.
 */

/** @type {Map<string, { socketId: string, connectedAt: Date }>} */
const connections = new Map();

/**
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    // ── Record connection ────────────────────────────────────────────────────
    connections.set(socket.id, { socketId: socket.id, connectedAt: new Date() });

    console.log(
      `[socket] + connected   id=${socket.id}  total=${connections.size}`
    );

    // ── Acknowledge the connection to the client ─────────────────────────────
    socket.emit('connection_ack', {
      socketId: socket.id,
      serverTime: new Date().toISOString(),
      message: 'Connected to ChatNow server',
    });

    // ── Phase-2 test event: client → server → client echo ───────────────────
    socket.on('ping_server', (payload, callback) => {
      console.log(`[socket] ping_server  id=${socket.id}  payload=${JSON.stringify(payload)}`);

      const response = {
        echo: payload,
        serverTime: new Date().toISOString(),
        socketId: socket.id,
      };

      // Support both callback-style and event-style acknowledgements
      if (typeof callback === 'function') {
        callback(response);
      } else {
        socket.emit('pong_client', response);
      }
    });

    // ── Error guard — prevent crashes from malformed events ──────────────────
    socket.on('error', (err) => {
      console.error(`[socket] error  id=${socket.id}  err=${err.message}`);
    });

    // ── Disconnection ────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      connections.delete(socket.id);
      console.log(
        `[socket] - disconnected id=${socket.id}  reason=${reason}  total=${connections.size}`
      );
    });
  });
}

module.exports = { registerSocketHandlers };
