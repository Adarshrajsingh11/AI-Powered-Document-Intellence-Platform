// Live end-to-end check against a RUNNING API (and its MongoDB).
//   1) start the API:  npm run dev:api
//   2) in another terminal:  npm run smoke
// Optional: API_URL=http://localhost:5000/api node infrastructure/scripts/smoke-test.mjs
const API = (process.env.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const email = `smoke-${Date.now()}@example.com`;
const password = 'smoke-test-123';
let passed = 0;

function step(name) {
  passed += 1;
  console.log(`  ok ${String(passed).padStart(2, '0')}  ${name}`);
}

function fail(message) {
  console.error(`\n  FAILED: ${message}`);
  process.exit(1);
}

async function call(path, { method = 'GET', body, token, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
  } catch (err) {
    fail(`Cannot reach ${API} (${err.message}). Is the API running?`);
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { status: res.status, data: json?.data, message: json?.message };
}

function expect(cond, message) {
  if (!cond) fail(message);
}

console.log(`Smoke test against ${API}\n`);

let r = await call('/health');
expect(r.status === 200, 'health endpoint failed');
expect(r.data.database === 'connected', `database is "${r.data.database}" - check MONGODB_URI in backend/.env`);
step('API is up and MongoDB is connected');

r = await call('/auth/register', { method: 'POST', body: { name: 'Smoke Test', email, password } });
expect(r.status === 201, `register failed: ${r.message}`);
step('register');

r = await call('/auth/login', { method: 'POST', body: { email, password } });
expect(r.status === 200 && r.data.token, `login failed: ${r.message}`);
const token = r.data.token;
step('login');

r = await call('/users/me', { token });
expect(r.data?.user?.email === email, 'GET /users/me failed');
step('profile');

const form = new FormData();
const text =
  'DocuMind smoke test document. The refund policy allows returns within thirty days. Shipping takes five business days.';
form.append('file', new Blob([text], { type: 'text/plain' }), 'smoke.txt');
r = await call('/documents', { method: 'POST', token, form });
expect(r.status === 201, `upload failed: ${r.message}`);
const docId = r.data.document.id;
step('upload document');

let doc;
for (let i = 0; i < 60; i += 1) {
  r = await call(`/documents/${docId}`, { token });
  doc = r.data.document;
  if (doc.status === 'ready' || doc.status === 'failed') break;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
expect(doc.status === 'ready', `document ended as "${doc.status}": ${doc.error ?? 'timed out after 60s'}`);
step(`document processed (${doc.chunkCount} chunk)`);

r = await call('/search', { method: 'POST', token, body: { query: 'refund policy', documentIds: [] } });
expect(r.status === 200 && r.data.results.length > 0, `search returned nothing: ${r.message ?? ''}`);
expect(r.data.results[0].documentName === 'smoke.txt', 'search returned the wrong document');
step('semantic search');

r = await call('/chat', { method: 'POST', token, body: { message: 'How long do I have to return an item?', documentIds: [] } });
expect(r.status === 200, `chat failed: ${r.message}`);
expect(r.data.message.content.length > 0, 'chat returned an empty answer');
expect(r.data.message.sources.length > 0, 'chat answer has no source citations');
step('chat answer with citations');
console.log(`\n  answer: ${r.data.message.content.slice(0, 160).replace(/\s+/g, ' ')}\n`);

r = await call(`/documents/${docId}`, { method: 'DELETE', token });
expect(r.status === 200, 'delete failed');
step('delete document');

console.log(`All ${passed} checks passed.`);
