import { STOPWORDS, tokenize } from '../utils/tokenCounter.js';

// Share of expected keywords that appear in the answer.
export function keywordCoverage(answer, expectedKeywords = []) {
  if (!expectedKeywords.length) return null;
  const lower = answer.toLowerCase();
  return expectedKeywords.filter((k) => lower.includes(k.toLowerCase())).length / expectedKeywords.length;
}

export function hasCitation(answer) {
  return /\[\d+\]/.test(answer) ? 1 : 0;
}

// Rough groundedness: share of the answer's meaningful words that occur in the retrieved context.
export function groundedness(answer, contextText) {
  const words = tokenize(answer.replace(/\[\d+\]/g, '')).filter((t) => !STOPWORDS.has(t));
  if (!words.length) return 0;
  const context = new Set(tokenize(contextText));
  return words.filter((w) => context.has(w)).length / words.length;
}
