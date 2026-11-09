export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function topByScore(scored, topK) {
  return scored.sort((x, y) => y.score - x.score).slice(0, topK);
}

// Interface every vector store implements. Swap these for Pinecone/Qdrant/pgvector later.
export class VectorStore {
  // upsert({ ownerId, documentId, documentName, embeddingModel, chunks: [{ index, page, text, embedding }] })
  async upsert() { throw new Error('not implemented'); }
  // query({ ownerId, documentIds, embedding, embeddingModel, topK }) -> [{ id, documentId, documentName, page, text, score }]
  async query() { throw new Error('not implemented'); }
  async deleteByDocument() { throw new Error('not implemented'); }
}

// Stores chunks in MongoDB (a Mongoose model is injected) and ranks with cosine similarity in Node.
// Fine for personal/small collections; replace with a dedicated vector DB when it grows.
export class MongoVectorStore extends VectorStore {
  constructor(model, { maxScan = 50000 } = {}) {
    super();
    this.model = model;
    this.maxScan = maxScan;
  }

  async upsert({ ownerId, documentId, documentName, embeddingModel, chunks }) {
    await this.deleteByDocument(documentId);
    const rows = chunks.map((c) => ({
      owner: ownerId,
      document: documentId,
      documentName,
      index: c.index,
      page: c.page ?? null,
      text: c.text,
      embedding: c.embedding,
      embeddingModel,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      await this.model.insertMany(rows.slice(i, i + 500));
    }
  }

  async query({ ownerId, documentIds = [], embedding, embeddingModel, topK = 5 }) {
    const filter = { owner: ownerId, embeddingModel };
    if (documentIds.length) filter.document = { $in: documentIds };
    const rows = await this.model.find(filter).select('+embedding').limit(this.maxScan).lean();
    const scored = rows.map((r) => ({
      id: String(r._id),
      documentId: String(r.document),
      documentName: r.documentName,
      page: r.page,
      text: r.text,
      score: cosineSimilarity(embedding, r.embedding),
    }));
    return topByScore(scored, topK);
  }

  async deleteByDocument(documentId) {
    await this.model.deleteMany({ document: documentId });
  }
}

// In-memory store, handy for tests and quick experiments.
export class MemoryVectorStore extends VectorStore {
  constructor() {
    super();
    this.rows = [];
  }

  async upsert({ ownerId, documentId, documentName, embeddingModel, chunks }) {
    await this.deleteByDocument(documentId);
    chunks.forEach((c) => {
      this.rows.push({
        id: `${documentId}:${c.index}`,
        owner: String(ownerId),
        document: String(documentId),
        documentName,
        page: c.page ?? null,
        text: c.text,
        embedding: c.embedding,
        embeddingModel,
      });
    });
  }

  async query({ ownerId, documentIds = [], embedding, embeddingModel, topK = 5 }) {
    const scored = this.rows
      .filter((r) => r.owner === String(ownerId) && r.embeddingModel === embeddingModel)
      .filter((r) => !documentIds.length || documentIds.map(String).includes(r.document))
      .map((r) => ({
        id: r.id,
        documentId: r.document,
        documentName: r.documentName,
        page: r.page,
        text: r.text,
        score: cosineSimilarity(embedding, r.embedding),
      }));
    return topByScore(scored, topK);
  }

  async deleteByDocument(documentId) {
    this.rows = this.rows.filter((r) => r.document !== String(documentId));
  }
}
