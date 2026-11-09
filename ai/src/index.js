import { createLLMProvider } from './providers/llm.provider.js';
import { createEmbeddingProvider } from './providers/embedding.provider.js';
import { createEmbeddingService } from './embeddings/embeddingService.js';
import { createVectorStore } from './vectorstore/vectorStoreFactory.js';
import { createRetriever } from './retrieval/retriever.js';
import { createRagPipeline } from './rag/ragPipeline.js';
import { ingestDocument } from './ingestion/ingestionPipeline.js';

export { createLLMProvider, createEmbeddingProvider, createEmbeddingService, createVectorStore, createRetriever, createRagPipeline, ingestDocument };
export { chunkText, chunkPages } from './ingestion/chunker.js';
export { extractText } from './ingestion/textExtractor.js';
export { loadDocument } from './ingestion/documentLoader.js';
export { cosineSimilarity, MemoryVectorStore, MongoVectorStore } from './vectorstore/vectorStore.js';
export { hybridSearch, keywordScore } from './retrieval/hybridSearch.js';
export { rerank } from './retrieval/reranker.js';
export { buildContext } from './rag/contextBuilder.js';
export { buildSystemPrompt, buildMessages } from './rag/promptBuilder.js';
export { buildCitations } from './rag/citationBuilder.js';
export { runEvaluation } from './evaluation/evaluationRunner.js';
export * from './evaluation/retrievalMetrics.js';
export * from './evaluation/answerMetrics.js';
export { estimateTokens } from './utils/tokenCounter.js';

// Wires providers, vector store, retriever and RAG pipeline together from plain config.
export function createAIServices({ llm, embeddings, vectorStore, rag = {}, chunking = {} } = {}) {
  const llmProvider = createLLMProvider(llm);
  const embeddingService = createEmbeddingService(createEmbeddingProvider(embeddings));
  const store = createVectorStore(vectorStore);
  const retriever = createRetriever({ embeddingService, vectorStore: store, hybrid: rag.hybrid ?? true });
  const pipeline = createRagPipeline({ retriever, llm: llmProvider, ...rag });

  return {
    llm: llmProvider,
    embeddingService,
    vectorStore: store,
    retriever,
    rag: pipeline,
    ingestDocument: (args) => ingestDocument({ ...args, embeddingService, vectorStore: store, ...chunking }),
  };
}
