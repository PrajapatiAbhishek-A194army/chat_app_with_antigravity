/**
 * Phase 2 integration test — verifies bidirectional Socket.IO communication.
 * Run: node test-socket.js
 * Requires backend to be running on localhost:3001.
 */

const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${label}`);
    failed++;
  }
}

console.log('\n[test] Connecting to', SERVER_URL, '...\n');

const socket = io(SERVER_URL, { transports: ['websocket'] });

const timeout = setTimeout(() => {
  console.error('\n[test] TIMEOUT — backend may not be running');
  process.exit(1);
}, 8000);

socket.on('connect', () => {
  console.log('[test] Connected  id =', socket.id);
  assert(typeof socket.id === 'string' && socket.id.length > 0, 'socket.id is a non-empty string');
});

socket.on('connection_ack', ({ socketId, serverTime, message }) => {
  assert(socketId === socket.id, 'connection_ack.socketId matches socket.id');
  assert(typeof serverTime === 'string', 'connection_ack.serverTime is a string');
  assert(typeof message === 'string', 'connection_ack.message is a string');
  console.log('[test] Received connection_ack');

  // Send ping and wait for pong
  socket.emit('ping_server', { clientTime: new Date().toISOString() }, (pong) => {
    assert(typeof pong === 'object', 'pong response is an object');
    assert(typeof pong.serverTime === 'string', 'pong.serverTime is present');
    assert(pong.socketId === socket.id, 'pong.socketId matches socket.id');
    console.log('[test] Received pong via callback');

    // Done
    clearTimeout(timeout);
    socket.disconnect();

    console.log(`\n[test] Results: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  });
});

socket.on('connect_error', (err) => {
  clearTimeout(timeout);
  console.error('[test] connect_error:', err.message);
  process.exit(1);
});
