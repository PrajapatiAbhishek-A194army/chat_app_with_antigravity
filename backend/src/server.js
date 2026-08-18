'use strict';

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const config = require('./config');
const { registerSocketHandlers } = require('./sockets');

// ── Express app ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

// Health-check endpoint so the frontend can verify the server is reachable
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── HTTP + Socket.IO server ────────────────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Register all Socket.IO event handlers ─────────────────────────────────────
registerSocketHandlers(io);

// ── Start listening ────────────────────────────────────────────────────────────
httpServer.listen(config.port, () => {
  console.log(`[server] running on http://localhost:${config.port}`);
  console.log(`[server] accepting connections from ${config.clientUrl}`);
  console.log('[server] NOTE: all chat data is temporary — restart clears state');
});

module.exports = { app, httpServer, io };
