import { ai } from '../config/ai.js';

export const searchService = {
  async search(user, { query, documentIds, topK }) {
    // ownerId is always the logged-in user, so results can never come from someone else's documents
    const results = await ai.retriever.retrieve({ query, ownerId: user.id, documentIds, topK });
    return results.map((r) => ({
      chunkId: r.id,
      documentId: r.documentId,
      documentName: r.documentName,
      page: r.page,
      text: r.text,
      score: r.score,
    }));
  },
};
