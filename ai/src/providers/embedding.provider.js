import { postJson } from '../utils/http.js';
import { STOPWORDS, tokenize } from '../utils/tokenCounter.js';

const DEFAULT_MODELS = {
  gemini: 'gemini-embedding-001',
  openai: 'text-embedding-3-small',
};

function requireKey(provider, apiKey) {
  if (!apiKey) throw new Error(`Missing API key for embedding provider "${provider}". Set it in backend/.env`);
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Offline "embedding" based on hashed words. Finds keyword overlap only (not real semantics),
// but lets the whole app run end-to-end without any API key.
function mockProvider({ dimensions = 384 } = {}) {
  return {
    name: 'mock',
    model: `mock:hash-${dimensions}`,
    maxBatchSize: 1000,
    async embed(texts) {
      return texts.map((text) => {
        const vec = new Array(dimensions).fill(0);
        for (const token of tokenize(text)) {
          if (STOPWORDS.has(token)) continue;
          const slot = fnv1a(token) % dimensions;
          vec[slot] += fnv1a(`${token}#`) & 1 ? 1 : -1;
        }
        const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
        return norm ? vec.map((v) => v / norm) : vec;
      });
    },
  };
}

function geminiProvider({ apiKey, model, dimensions }) {
  requireKey('gemini', apiKey);
  return {
    name: 'gemini',
    model: `gemini:${model}${dimensions ? `:${dimensions}` : ''}`,
    maxBatchSize: 50,
    async embed(texts, { taskType = 'document' } = {}) {
      const data = await postJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents`, {
        headers: { 'x-goog-api-key': apiKey },
        body: {
          requests: texts.map((text) => ({
            model: `models/${model}`,
            content: { parts: [{ text }] },
            taskType: taskType === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT',
            outputDimensionality: dimensions,
          })),
        },
      });
      return data.embeddings.map((e) => e.values);
    },
  };
}

function openaiProvider({ apiKey, model, dimensions }) {
  requireKey('openai', apiKey);
  return {
    name: 'openai',
    model: `openai:${model}${dimensions ? `:${dimensions}` : ''}`,
    maxBatchSize: 256,
    async embed(texts) {
      const data = await postJson('https://api.openai.com/v1/embeddings', {
        headers: { Authorization: `Bearer ${apiKey}` },
        body: { model, input: texts, dimensions },
      });
      return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
    },
  };
}

// Returns { name, model, maxBatchSize, embed(texts, { taskType }) -> number[][] }
export function createEmbeddingProvider({ provider = 'mock', apiKey, model, dimensions } = {}) {
  const resolvedModel = model || DEFAULT_MODELS[provider];
  switch (provider) {
    case 'mock':
      return mockProvider({ dimensions });
    case 'gemini':
      return geminiProvider({ apiKey, model: resolvedModel, dimensions });
    case 'openai':
      return openaiProvider({ apiKey, model: resolvedModel, dimensions });
    default:
      throw new Error(`Unknown embedding provider: ${provider}`);
  }
}
