// These tests need no database: they cover routing, validation and auth guards.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

let server;
let base;

before(async () => {
  const { createApp } = await import('../../app.js');
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => server.close());

const post = (path, body) =>
  fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('GET /health is public', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.status, 'ok');
});

test('unknown route -> 404 json', async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).success, false);
});

test('protected routes reject missing / bad tokens', async () => {
  for (const path of ['/users/me', '/documents', '/chat/conversations']) {
    assert.equal((await fetch(`${base}${path}`)).status, 401, path);
  }
  const bad = await fetch(`${base}/users/me`, { headers: { Authorization: 'Bearer garbage' } });
  assert.equal(bad.status, 401);
  assert.equal((await post('/search', { query: 'x' })).status, 401);
  assert.equal((await post('/chat', { message: 'x' })).status, 401);
});

test('register validates input before touching the database', async () => {
  const res = await post('/auth/register', { name: 'A', email: 'bad', password: '1' });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.ok(Array.isArray(json.errors));
});

test('malformed JSON -> 400', async () => {
  const res = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
  assert.equal(res.status, 400);
});
