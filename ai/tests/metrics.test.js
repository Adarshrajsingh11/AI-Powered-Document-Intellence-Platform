import test from 'node:test';
import assert from 'node:assert/strict';
import { hitRate, recallAtK, precisionAtK, reciprocalRank, keywordCoverage, hasCitation, groundedness, cosineSimilarity } from '../src/index.js';

test('retrieval metrics', () => {
  const retrieved = ['a', 'b', 'c'];
  assert.equal(hitRate(retrieved, ['c']), 1);
  assert.equal(hitRate(retrieved, ['z']), 0);
  assert.equal(recallAtK(retrieved, ['a', 'z'], 3), 0.5);
  assert.equal(precisionAtK(retrieved, ['a', 'b'], 2), 1);
  assert.equal(reciprocalRank(retrieved, ['b']), 0.5);
});

test('answer metrics', () => {
  assert.equal(keywordCoverage('The capital is Paris', ['paris', 'france']), 0.5);
  assert.equal(hasCitation('Yes [1]'), 1);
  assert.equal(hasCitation('Yes'), 0);
  assert.ok(groundedness('paris is the capital [1]', 'paris is the capital of france') > 0.9);
});

test('cosine similarity', () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
  assert.equal(cosineSimilarity([1], [1, 2]), 0);
});
