import { hitRate, precisionAtK, recallAtK, reciprocalRank } from './retrievalMetrics.js';
import { groundedness, hasCitation, keywordCoverage } from './answerMetrics.js';

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// dataset: [{ question, relevantDocumentIds?: string[], expectedKeywords?: string[] }]
export async function runEvaluation({ dataset, rag, ownerId, topK = 5, withAnswers = true }) {
  const rows = [];
  for (const item of dataset) {
    const retrieved = await rag.retrieve({ query: item.question, ownerId, topK });
    const ids = retrieved.map((r) => r.documentId);
    const row = { question: item.question };

    if (item.relevantDocumentIds?.length) {
      row.hitRate = hitRate(ids, item.relevantDocumentIds);
      row.recall = recallAtK(ids, item.relevantDocumentIds, topK);
      row.precision = precisionAtK(ids, item.relevantDocumentIds, topK);
      row.mrr = reciprocalRank(ids, item.relevantDocumentIds);
    }
    if (withAnswers) {
      const { answer } = await rag.answer({ question: item.question, ownerId });
      row.answer = answer;
      row.keywordCoverage = keywordCoverage(answer, item.expectedKeywords);
      row.hasCitation = hasCitation(answer);
      row.groundedness = groundedness(answer, retrieved.map((r) => r.text).join(' '));
    }
    rows.push(row);
  }

  const pick = (key) => mean(rows.map((r) => r[key]).filter((v) => typeof v === 'number'));
  return {
    count: rows.length,
    summary: {
      hitRate: pick('hitRate'),
      recall: pick('recall'),
      precision: pick('precision'),
      mrr: pick('mrr'),
      keywordCoverage: pick('keywordCoverage'),
      citationRate: pick('hasCitation'),
      groundedness: pick('groundedness'),
    },
    rows,
  };
}
