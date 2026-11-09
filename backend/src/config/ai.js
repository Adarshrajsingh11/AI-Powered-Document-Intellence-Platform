import { createAIServices } from '../../../ai/src/index.js';
import { Chunk } from '../models/Chunk.js';
import { env } from './env.js';

const keys = {
  gemini: env.GEMINI_API_KEY,
  openai: env.OPENAI_API_KEY,
  anthropic: env.ANTHROPIC_API_KEY,
  groq: env.GROQ_API_KEY,
};

// One shared instance of the AI layer (providers, vector store, retriever, RAG pipeline).
export const ai = createAIServices({
  llm: { provider: env.LLM_PROVIDER, apiKey: keys[env.LLM_PROVIDER], model: env.LLM_MODEL },
  embeddings: {
    provider: env.EMBEDDING_PROVIDER,
    apiKey: keys[env.EMBEDDING_PROVIDER],
    model: env.EMBEDDING_MODEL,
    dimensions: env.EMBEDDING_DIMENSIONS,
  },
  vectorStore: { type: 'mongo', model: Chunk },
  rag: { topK: env.RETRIEVAL_TOP_K, minScore: env.RETRIEVAL_MIN_SCORE },
  chunking: { chunkSize: env.CHUNK_SIZE, chunkOverlap: env.CHUNK_OVERLAP },
});