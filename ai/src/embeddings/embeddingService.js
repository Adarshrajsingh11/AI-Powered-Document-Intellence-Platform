export function createEmbeddingService(provider, { batchSize } = {}) {
  const size = Math.max(1, Math.min(batchSize ?? provider.maxBatchSize, provider.maxBatchSize));

  return {
    name: provider.name,
    model: provider.model,

    async embedTexts(texts) {
      const vectors = [];
      for (let i = 0; i < texts.length; i += size) {
        const batch = texts.slice(i, i + size);
        const result = await provider.embed(batch, { taskType: 'document' });
        if (result.length !== batch.length) throw new Error('Embedding provider returned an unexpected number of vectors');
        vectors.push(...result);
      }
      return vectors;
    },

    async embedQuery(text) {
      const [vector] = await provider.embed([text], { taskType: 'query' });
      return vector;
    },
  };
}
