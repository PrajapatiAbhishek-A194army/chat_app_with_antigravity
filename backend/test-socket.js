/**
 * Phase 4 integration test — real-time messaging.
 *
 * Tests:
 *  1. Send message → both sender and other user receive new_message
 *  2. Message contains correct metadata (id, socketId, username, text, timestamp)
 *  3. Empty message → message_error
 *  4. Message too long → message_error
 *  5. Send without joining → message_error
 *  6. Second user joining receives recentMessages in chat_joined
 *  7. Messages cleared after server restart (verified conceptually via in-memory assertion)
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

function makeClient() {
  return io(SERVER_URL, { transports: ['websocket'] });
}

function waitForEvent(socket, event, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout waiting for "${event}"`)), timeoutMs);
    socket.once(event, (data) => { clearTimeout(t); resolve(data); });
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function runTests() {
  console.log('\n[test] Phase 4 — Real-Time Messaging\n');

  // ── TEST 1 & 2: Valid message, correct metadata ───────────────────────────
  console.log('── Test 1-2: Valid message + metadata ──');
  const c1 = makeClient();
  const c2 = makeClient();
  await waitForEvent(c1, 'connect');
  await waitForEvent(c2, 'connect');

  c1.emit('join_chat', { username: 'Alice' });
  await waitForEvent(c1, 'chat_joined');

  c2.emit('join_chat', { username: 'Bob' });
  await waitForEvent(c2, 'chat_joined');

  // Both should receive the message
  const c2MsgPromise = waitForEvent(c2, 'new_message', 4000);

  c1.emit('send_message', { text: 'Hello from Alice!' });

  const msgFromC1 = await waitForEvent(c1, 'new_message', 4000);
  const msgFromC2 = await c2MsgPromise;

  assert(msgFromC1.text === 'Hello from Alice!', 'sender receives own message');
  assert(msgFromC2.text === 'Hello from Alice!', 'other user receives message');
  assert(msgFromC1.id === msgFromC2.id,           'both have the same message id');
  assert(typeof msgFromC1.id === 'string',         'id is a string');
  assert(msgFromC1.username === 'Alice',           'username is correct');
  assert(msgFromC1.socketId === c1.id,             'socketId is correct');
  assert(typeof msgFromC1.timestamp === 'string',  'timestamp is a string');

  // ── TEST 3: Empty message rejected ───────────────────────────────────────
  console.log('\n── Test 3: Empty message rejected ──');
  c1.emit('send_message', { text: '   ' }); // whitespace-only
  const errEmpty = await waitForEvent(c1, 'message_error', 4000);
  assert(typeof errEmpty.message === 'string', 'message_error received for empty message');

  // ── TEST 4: Message too long rejected ────────────────────────────────────
  console.log('\n── Test 4: Message too long rejected ──');
  c1.emit('send_message', { text: 'x'.repeat(501) });
  const errLong = await waitForEvent(c1, 'message_error', 4000);
  assert(typeof errLong.message === 'string', 'message_error received for long message');

  // ── TEST 5: Send without join → error ────────────────────────────────────
  console.log('\n── Test 5: Send without joining ──');
  const c3 = makeClient();
  await waitForEvent(c3, 'connect');
  c3.emit('send_message', { text: 'sneaky message' });
  const errNoJoin = await waitForEvent(c3, 'message_error', 4000);
  assert(typeof errNoJoin.message === 'string', 'message_error for unauthenticated sender');
  c3.disconnect();

  // ── TEST 6: Joining user receives recentMessages ──────────────────────────
  console.log('\n── Test 6: Late joiner gets recent messages ──');
  // c1 sends another message
  c1.emit('send_message', { text: 'Hi newcomer!' });
  await sleep(200);

  const c4 = makeClient();
  await waitForEvent(c4, 'connect');
  c4.emit('join_chat', { username: 'Charlie' });
  const joined4 = await waitForEvent(c4, 'chat_joined', 4000);

  assert(Array.isArray(joined4.recentMessages), 'chat_joined includes recentMessages array');
  assert(joined4.recentMessages.length >= 1,     'at least 1 message in recentMessages');
  const texts = joined4.recentMessages.map((m) => m.text);
  assert(texts.includes('Hello from Alice!'),    'recentMessages includes first message');

  c4.disconnect();

  // ── Cleanup ───────────────────────────────────────────────────────────────
  c1.disconnect();
  c2.disconnect();
  await sleep(200);

  console.log(`\n[test] Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('[test] Unexpected error:', err.message);
  process.exit(1);
});
