import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createAIServices, runEvaluation } from '../src/index.js';

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'documind-'));
  const files = {
    'cooking.txt': 'Pasta carbonara is made with eggs, pecorino cheese, guanciale and black pepper. Never add cream to carbonara.',
    'space.md': '# Mars\n\nMars is the fourth planet from the Sun. Its red colour comes from iron oxide on the surface.',
  };
  for (const [name, content] of Object.entries(files)) await fs.writeFile(path.join(dir, name), content);
  const ai = createAIServices({ llm: { provider: 'mock' }, embeddings: { provider: 'mock' }, vectorStore: { type: 'memory' } });
  return { dir, ai };
}

test('ingest -> retrieve -> answer with citations, isolated per owner', async () => {
  const { dir, ai } = await setup();
  const a = await ai.ingestDocument({ filePath: path.join(dir, 'cooking.txt'), originalName: 'cooking.txt', ownerId: 'u1', documentId: 'd1' });
  await ai.ingestDocument({ filePath: path.join(dir, 'space.md'), originalName: 'space.md', ownerId: 'u1', documentId: 'd2' });
  await ai.ingestDocument({ filePath: path.join(dir, 'space.md'), originalName: 'other.md', ownerId: 'u2', documentId: 'd3' });
  assert.equal(a.chunkCount, 1);

  const results = await ai.retriever.retrieve({ query: 'What goes into carbonara?', ownerId: 'u1', topK: 3 });
  assert.equal(results[0].documentName, 'cooking.txt');
  assert.ok(results.every((r) => r.documentId !== 'd3'), 'must not leak other users data');

  const { answer, sources } = await ai.rag.answer({ question: 'Why is Mars red?', ownerId: 'u1' });
  assert.match(answer, /\[1\]/);
  assert.equal(sources[0].documentName, 'space.md');

  const filtered = await ai.rag.answer({ question: 'Why is Mars red?', ownerId: 'u1', documentIds: ['d1'] });
  assert.equal(filtered.sources[0].documentName, 'cooking.txt');
});

test('nothing stored -> polite not-found answer, no LLM call', async () => {
  const ai = createAIServices({ llm: { provider: 'mock' }, embeddings: { provider: 'mock' }, vectorStore: { type: 'memory' } });
  const out = await ai.rag.answer({ question: 'anything?', ownerId: 'nobody' });
  assert.deepEqual(out.sources, []);
  assert.match(out.answer, /couldn't find/i);
});

test('deleteByDocument removes chunks', async () => {
  const { dir, ai } = await setup();
  await ai.ingestDocument({ filePath: path.join(dir, 'cooking.txt'), originalName: 'cooking.txt', ownerId: 'u1', documentId: 'd1' });
  await ai.vectorStore.deleteByDocument('d1');
  const r = await ai.retriever.retrieve({ query: 'carbonara', ownerId: 'u1' });
  assert.equal(r.length, 0);
});

test('evaluation runner produces metrics', async () => {
  const { dir, ai } = await setup();
  await ai.ingestDocument({ filePath: path.join(dir, 'cooking.txt'), originalName: 'cooking.txt', ownerId: 'u1', documentId: 'd1' });
  await ai.ingestDocument({ filePath: path.join(dir, 'space.md'), originalName: 'space.md', ownerId: 'u1', documentId: 'd2' });
  const report = await runEvaluation({
    dataset: [
      { question: 'What is in carbonara?', relevantDocumentIds: ['d1'], expectedKeywords: ['eggs'] },
      { question: 'Which planet is red?', relevantDocumentIds: ['d2'], expectedKeywords: ['iron'] },
    ],
    rag: ai.rag,
    ownerId: 'u1',
  });
  assert.equal(report.count, 2);
  assert.equal(report.summary.hitRate, 1);
  assert.equal(report.summary.mrr, 1);
});

test('unsupported file type and unknown provider are rejected', async () => {
  const { dir, ai } = await setup();
  await fs.writeFile(path.join(dir, 'x.exe'), 'bin');
  await assert.rejects(ai.ingestDocument({ filePath: path.join(dir, 'x.exe'), originalName: 'x.exe', ownerId: 'u', documentId: 'd' }), /Unsupported/);
  assert.throws(() => createAIServices({ llm: { provider: 'nope' }, embeddings: { provider: 'mock' }, vectorStore: {} }), /Unknown LLM/);
  assert.throws(() => createAIServices({ llm: { provider: 'gemini' }, embeddings: { provider: 'mock' }, vectorStore: {} }), /Missing API key/);
});
