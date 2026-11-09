import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkText, chunkPages } from '../src/index.js';

test('short text stays one chunk', () => {
  assert.deepEqual(chunkText('Hello world.'), ['Hello world.']);
});

test('empty text gives no chunks', () => {
  assert.deepEqual(chunkText('   \n\n  '), []);
});

test('long text is split, bounded, and keeps all content', () => {
  const para = 'Sentence number one is here. Another sentence follows it. ';
  const text = Array.from({ length: 80 }, (_, i) => `${para}Marker${i}.`).join('\n\n');
  const chunks = chunkText(text, { chunkSize: 400, chunkOverlap: 60 });
  assert.ok(chunks.length > 5);
  for (const c of chunks) assert.ok(c.length <= 400 + 60 + 2, `chunk too long: ${c.length}`);
  const joined = chunks.join(' ');
  for (let i = 0; i < 80; i += 1) assert.ok(joined.includes(`Marker${i}.`), `lost Marker${i}`);
});

test('a single huge word-run is hard split', () => {
  const chunks = chunkText('x'.repeat(2500), { chunkSize: 1000, chunkOverlap: 100 });
  assert.ok(chunks.length >= 3);
});

test('chunkPages keeps page numbers and global index', () => {
  const chunks = chunkPages([{ page: 1, text: 'Page one text.' }, { page: 2, text: 'Page two text.' }]);
  assert.deepEqual(chunks.map((c) => [c.index, c.page]), [[0, 1], [1, 2]]);
});
