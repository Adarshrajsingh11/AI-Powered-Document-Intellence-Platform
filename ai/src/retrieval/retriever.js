import { hybridSearch } from './hybridSearch.js';
import { rerank } from './reranker.js';

export function createRetriever({ embeddingService, vectorStore, hybrid = true }) {
  return {
    async retrieve({ query, ownerId, documentIds = [], topK = 5 }) {
      const embedding = await embeddingService.embedQuery(query);
      const candidates = await vectorStore.query({
        ownerId,
        documentIds,
        embedding,
        embeddingModel: embeddingService.model,
        topK: topK * 4,
      });
      const scored = hybrid ? hybridSearch(query, candidates) : candidates;
      return rerank(scored, { topK }).map((r) => ({ ...r, score: Math.max(0, Math.min(1, r.score)) }));
    },
  };
}
