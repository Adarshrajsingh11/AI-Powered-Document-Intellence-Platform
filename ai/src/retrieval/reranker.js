import { tokenize } from '../utils/tokenCounter.js';

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

// Sort by score, drop near-duplicate chunks (from overlap), keep the best topK.
export function rerank(results, { topK = 5, dedupeThreshold = 0.85 } = {}) {
  const selected = [];
  const sets = [];
  for (const r of [...results].sort((a, b) => b.score - a.score)) {
    if (selected.length >= topK) break;
    const set = new Set(tokenize(r.text));
    if (sets.some((s) => jaccard(s, set) >= dedupeThreshold)) continue;
    selected.push(r);
    sets.push(set);
  }
  return selected;
}
