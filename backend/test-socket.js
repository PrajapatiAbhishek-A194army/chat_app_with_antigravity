/**
 * Phase 5 integration test — typing indicators.
 *
 * Tests:
 *  1. typing_start → other user receives user_typing with correct metadata
 *  2. typing_start appears in typingUsers list
 *  3. typing_stop → other user receives user_stopped_typing
 *  4. typingUsers is empty after typing_stop
 *  5. Disconnect while typing → user_stopped_typing broadcast
 *  6. Sending a message auto-clears typing (user_stopped_typing after send_message)
 *  7. Non-joined socket sending typing_start is silently ignored
 *  8. chat_joined includes current typingUsers snapshot
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

async function joinAs(socket, username) {
  socket.emit('join_chat', { username });
  return waitForEvent(socket, 'chat_joined', 4000);
}

async function runTests() {
  console.log('\n[test] Phase 5 — Typing Indicators\n');

  const c1 = makeClient();
  const c2 = makeClient();
  await waitForEvent(c1, 'connect');
  await waitForEvent(c2, 'connect');
  await joinAs(c1, 'Alice');
  await joinAs(c2, 'Bob');

  // ── TEST 1 & 2: typing_start → user_typing with correct data ─────────────
  console.log('── Test 1-2: typing_start → user_typing broadcast ──');

  const typingPromise = waitForEvent(c2, 'user_typing', 4000);
  c1.emit('typing_start');
  const typingEvent = await typingPromise;

  assert(typingEvent.socketId === c1.id,           'user_typing.socketId = Alice socket');
  assert(typingEvent.username === 'Alice',          'user_typing.username = "Alice"');
  assert(Array.isArray(typingEvent.typingUsers),    'user_typing.typingUsers is array');
  assert(typingEvent.typingUsers.length === 1,      'typingUsers has 1 entry');
  assert(typingEvent.typingUsers[0].username === 'Alice', 'typingUsers[0] is Alice');

  // Sender (c1) should NOT receive their own user_typing event
  let selfReceived = false;
  c1.once('user_typing', () => { selfReceived = true; });

  // ── TEST 3 & 4: typing_stop → user_stopped_typing ──────────────────────
  console.log('\n── Test 3-4: typing_stop → user_stopped_typing ──');

  const stopPromise = waitForEvent(c2, 'user_stopped_typing', 4000);
  c1.emit('typing_stop');
  const stopEvent = await stopPromise;

  assert(stopEvent.socketId === c1.id,           'user_stopped_typing.socketId correct');
  assert(stopEvent.username === 'Alice',          'user_stopped_typing.username = "Alice"');
  assert(Array.isArray(stopEvent.typingUsers),    'user_stopped_typing.typingUsers is array');
  assert(stopEvent.typingUsers.length === 0,      'typingUsers is empty after stop');

  await sleep(100);
  assert(!selfReceived, 'sender does NOT receive own user_typing');

  // ── TEST 5: Disconnect while typing → user_stopped_typing broadcast ───────
  console.log('\n── Test 5: Disconnect while typing ──');
  const c3 = makeClient();
  await waitForEvent(c3, 'connect');
  await joinAs(c3, 'Charlie');

  c3.emit('typing_start');
  await waitForEvent(c2, 'user_typing', 4000); // wait for typing to propagate

  const disconnectStopPromise = waitForEvent(c2, 'user_stopped_typing', 4000);
  c3.disconnect();
  const disconnectStop = await disconnectStopPromise;

  assert(disconnectStop.username === 'Charlie', 'disconnect clears typing: username = "Charlie"');
  assert(disconnectStop.typingUsers.length === 0, 'typingUsers empty after disconnect');

  // ── TEST 6: Sending a message auto-clears typing ──────────────────────────
  console.log('\n── Test 6: send_message auto-clears typing ──');
  c1.emit('typing_start');
  await waitForEvent(c2, 'user_typing', 4000);

  const autoStopPromise = waitForEvent(c2, 'user_stopped_typing', 4000);
  c1.emit('send_message', { text: 'Auto clear test' });
  const autoStop = await autoStopPromise;

  assert(autoStop.username === 'Alice',         'send_message auto-clears typing for Alice');
  assert(autoStop.typingUsers.length === 0,     'typingUsers empty after message send');

  // ── TEST 7: Non-joined socket → typing_start silently ignored ────────────
  console.log('\n── Test 7: Non-joined socket typing_start ignored ──');
  const c4 = makeClient();
  await waitForEvent(c4, 'connect');

  let rogue = false;
  c2.once('user_typing', () => { rogue = true; });
  c4.emit('typing_start');
  await sleep(300);

  assert(!rogue, 'user_typing NOT broadcast from unjoined socket');
  c4.disconnect();

  // ── TEST 8: chat_joined includes typingUsers snapshot ─────────────────────
  console.log('\n── Test 8: chat_joined includes typingUsers snapshot ──');

  // Alice starts typing, then a new user joins
  c1.emit('typing_start');
  await sleep(100);

  const c5 = makeClient();
  await waitForEvent(c5, 'connect');
  c5.emit('join_chat', { username: 'Dave' });
  const daveJoined = await waitForEvent(c5, 'chat_joined', 4000);

  assert(Array.isArray(daveJoined.typingUsers), 'chat_joined.typingUsers is array');
  assert(
    daveJoined.typingUsers.some((u) => u.username === 'Alice'),
    'Dave sees Alice in typingUsers snapshot'
  );

  c5.disconnect();
  c1.emit('typing_stop');
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
