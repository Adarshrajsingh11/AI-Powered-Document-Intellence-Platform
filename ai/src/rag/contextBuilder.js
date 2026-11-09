import { estimateTokens } from '../utils/tokenCounter.js';

// Numbers each retrieved chunk [1], [2], ... within a token budget.
export function buildContext(results, { maxTokens = 3000 } = {}) {
  const sources = [];
  const blocks = [];
  let used = 0;
  for (const r of results) {
    const header = `[${sources.length + 1}] Source: ${r.documentName}${r.page != null ? ` (page ${r.page})` : ''}`;
    const block = `${header}\n${r.text}`;
    const cost = estimateTokens(block);
    if (sources.length && used + cost > maxTokens) break;
    used += cost;
    blocks.push(block);
    sources.push({
      documentId: r.documentId,
      documentName: r.documentName,
      page: r.page,
      snippet: r.text.slice(0, 220),
      score: r.score,
    });
  }
  return { contextText: blocks.join('\n\n'), sources };
}
