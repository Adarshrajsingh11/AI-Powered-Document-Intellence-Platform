import test from 'node:test';
import assert from 'node:assert/strict';
import { createLLMProvider, createEmbeddingProvider } from '../src/index.js';

function mockFetch(responseJson) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return new Response(JSON.stringify(responseJson), { status: 200 });
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test('gemini llm request/response shape', async () => {
  const m = mockFetch({ candidates: [{ content: { parts: [{ text: 'hi ' }, { text: 'there' }] } }] });
  try {
    const llm = createLLMProvider({ provider: 'gemini', apiKey: 'k' });
    const out = await llm.generate({ system: 'sys', messages: [{ role: 'user', content: 'q' }, { role: 'assistant', content: 'a' }] });
    assert.equal(out, 'hi there');
    assert.match(m.calls[0].url, /models\/gemini-2\.5-flash:generateContent/);
    assert.equal(m.calls[0].init.headers['x-goog-api-key'], 'k');
    assert.equal(m.calls[0].body.contents[1].role, 'model');
    assert.equal(m.calls[0].body.systemInstruction.parts[0].text, 'sys');
  } finally { m.restore(); }
});

test('openai llm + embeddings shape', async () => {
  let m = mockFetch({ choices: [{ message: { content: 'ok' } }] });
  try {
    const llm = createLLMProvider({ provider: 'openai', apiKey: 'k' });
    assert.equal(await llm.generate({ system: 's', messages: [{ role: 'user', content: 'q' }] }), 'ok');
    assert.equal(m.calls[0].body.messages[0].role, 'system');
    assert.equal(m.calls[0].init.headers.Authorization, 'Bearer k');
  } finally { m.restore(); }
  m = mockFetch({ data: [{ index: 1, embedding: [2] }, { index: 0, embedding: [1] }] });
  try {
    const emb = createEmbeddingProvider({ provider: 'openai', apiKey: 'k' });
    assert.deepEqual(await emb.embed(['a', 'b']), [[1], [2]]);
  } finally { m.restore(); }
});

test('anthropic llm shape', async () => {
  const m = mockFetch({ content: [{ type: 'text', text: 'claude says hi' }] });
  try {
    const llm = createLLMProvider({ provider: 'anthropic', apiKey: 'k', model: 'x' });
    assert.equal(await llm.generate({ system: 's', messages: [{ role: 'user', content: 'q' }] }), 'claude says hi');
    assert.equal(m.calls[0].init.headers['x-api-key'], 'k');
    assert.equal(m.calls[0].body.system, 's');
  } finally { m.restore(); }
});

test('gemini embeddings: query vs document task type', async () => {
  const m = mockFetch({ embeddings: [{ values: [0.1, 0.2] }] });
  try {
    const emb = createEmbeddingProvider({ provider: 'gemini', apiKey: 'k', dimensions: 768 });
    await emb.embed(['x'], { taskType: 'query' });
    assert.equal(m.calls[0].body.requests[0].taskType, 'RETRIEVAL_QUERY');
    assert.equal(m.calls[0].body.requests[0].outputDimensionality, 768);
    assert.match(emb.model, /768/);
  } finally { m.restore(); }
});

test('provider http errors surface a readable message', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'bad key' } }), { status: 401 });
  try {
    const llm = createLLMProvider({ provider: 'openai', apiKey: 'k' });
    await assert.rejects(llm.generate({ messages: [{ role: 'user', content: 'q' }] }), /401.*bad key/);
  } finally { globalThis.fetch = original; }
});
