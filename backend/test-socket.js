/**
 * Phase 3 integration test — temporary user sessions.
 *
 * Tests:
 *  1. Valid join → chat_joined received
 *  2. Duplicate username → chat_error
 *  3. Invalid username (too short) → chat_error
 *  4. Second client sees user_joined when first joins
 *  5. Users list is correct after two joins
 *  6. Disconnect removes user from list (user_left broadcast)
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
    socket.once(event, (data) => {
      clearTimeout(t);
      resolve(data);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  console.log('\n[test] Phase 3 — Temporary User Session\n');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: Valid join
  // ─────────────────────────────────────────────────────────────────────────
  console.log('── Test 1: Valid join ──');
  const c1 = makeClient();
  await waitForEvent(c1, 'connect');

  c1.emit('join_chat', { username: 'Alice' });
  const joined1 = await waitForEvent(c1, 'chat_joined', 4000);

  assert(joined1.user.username === 'Alice', 'chat_joined user.username = "Alice"');
  assert(joined1.user.socketId === c1.id, 'chat_joined user.socketId matches socket');
  assert(typeof joined1.user.joinedAt === 'string', 'chat_joined user.joinedAt is string');
  assert(Array.isArray(joined1.users), 'chat_joined users is an array');
  assert(joined1.users.length === 1, 'users list has 1 user');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Duplicate username
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Test 2: Duplicate username ──');
  const c2 = makeClient();
  await waitForEvent(c2, 'connect');

  c2.emit('join_chat', { username: 'Alice' });
  const err2 = await waitForEvent(c2, 'chat_error', 4000);

  assert(typeof err2.message === 'string', 'chat_error.message is a string');
  assert(err2.message.toLowerCase().includes('taken'), 'chat_error mentions "taken"');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Invalid username (too short)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Test 3: Invalid username (1 char) ──');
  c2.emit('join_chat', { username: 'X' });
  const err3 = await waitForEvent(c2, 'chat_error', 4000);

  assert(typeof err3.message === 'string', 'chat_error.message is a string');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: Second client sees user_joined when first was already in
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Test 4: user_joined broadcast ──');

  // Listen for user_joined on c1 BEFORE c2 joins
  const userJoinedPromise = waitForEvent(c1, 'user_joined', 4000);

  c2.emit('join_chat', { username: 'Bob' });
  const joined2 = await waitForEvent(c2, 'chat_joined', 4000);
  const userJoined = await userJoinedPromise;

  assert(joined2.user.username === 'Bob', 'Bob: chat_joined.user.username = "Bob"');
  assert(userJoined.user.username === 'Bob', 'Alice sees user_joined with username "Bob"');
  assert(joined2.users.length === 2, 'users list has 2 users after Bob joins');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Users list correct
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Test 5: Users list ──');
  const names = joined2.users.map((u) => u.username).sort();
  assert(names.includes('Alice'), 'users list contains Alice');
  assert(names.includes('Bob'),   'users list contains Bob');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 6: Disconnect removes user
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n── Test 6: Disconnect removes user ──');
  const userLeftPromise = waitForEvent(c2, 'user_left', 4000);

  c1.disconnect();
  const userLeft = await userLeftPromise;

  assert(userLeft.user.username === 'Alice', 'user_left.user.username = "Alice"');
  assert(userLeft.users.length === 1, 'users list has 1 user after Alice disconnects');
  assert(userLeft.users[0].username === 'Bob', 'remaining user is Bob');

  // ─────────────────────────────────────────────────────────────────────────
  c2.disconnect();
  await sleep(200);

  console.log(`\n[test] Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('[test] Unexpected error:', err.message);
  process.exit(1);
});
