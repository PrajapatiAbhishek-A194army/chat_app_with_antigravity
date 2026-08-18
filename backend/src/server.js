'use strict';

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const config = require('./config');

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

// ── Basic Socket.IO connection handling (Phase 1 foundation) ──────────────────
io.on('connection', (socket) => {
  console.log(`[socket] connected   id=${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[socket] disconnected id=${socket.id} reason=${reason}`);
  });
});

// ── Start listening ────────────────────────────────────────────────────────────
httpServer.listen(config.port, () => {
  console.log(`[server] running on http://localhost:${config.port}`);
  console.log(`[server] accepting connections from ${config.clientUrl}`);
  console.log('[server] NOTE: all chat data is temporary — restart clears state');
});

module.exports = { app, httpServer, io };
