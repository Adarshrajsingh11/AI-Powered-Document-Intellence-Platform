import { STOPWORDS, tokenize } from '../utils/tokenCounter.js';

// Fraction of the query's meaningful words that appear in the text (0..1).
export function keywordScore(query, text) {
  const terms = [...new Set(tokenize(query).filter((t) => !STOPWORDS.has(t)))];
  if (!terms.length) return 0;
  const words = new Set(tokenize(text));
  return terms.filter((t) => words.has(t)).length / terms.length;
}

// Blend vector similarity with keyword overlap so exact terms (names, IDs, numbers) still match.
export function hybridSearch(query, candidates, { vectorWeight = 0.75, keywordWeight = 0.25 } = {}) {
  return candidates
    .map((c) => {
      const kw = keywordScore(query, c.text);
      return { ...c, vectorScore: c.score, keywordScore: kw, score: vectorWeight * c.score + keywordWeight * kw };
    })
    .sort((a, b) => b.score - a.score);
}
