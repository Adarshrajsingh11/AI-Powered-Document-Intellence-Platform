import { MemoryVectorStore, MongoVectorStore } from './vectorStore.js';

export function createVectorStore({ type = 'memory', model, maxScan } = {}) {
  switch (type) {
    case 'mongo':
      if (!model) throw new Error('The mongo vector store needs a Mongoose model');
      return new MongoVectorStore(model, { maxScan });
    case 'memory':
      return new MemoryVectorStore();
    default:
      throw new Error(`Unknown vector store type: ${type}`);
  }
}
