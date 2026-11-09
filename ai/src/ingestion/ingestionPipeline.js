import { loadDocument } from './documentLoader.js';
import { extractText } from './textExtractor.js';
import { chunkPages } from './chunker.js';

// load -> extract text -> chunk -> embed -> store
export async function ingestDocument({
  filePath,
  originalName,
  mimeType,
  ownerId,
  documentId,
  embeddingService,
  vectorStore,
  chunkSize,
  chunkOverlap,
}) {
  const loaded = await loadDocument(filePath, { originalName, mimeType });
  const pages = await extractText(loaded);
  const chunks = chunkPages(pages, { chunkSize, chunkOverlap });
  if (!chunks.length) throw new Error('Document produced no text chunks');

  const embeddings = await embeddingService.embedTexts(chunks.map((c) => c.text));
  await vectorStore.upsert({
    ownerId,
    documentId,
    documentName: loaded.originalName,
    embeddingModel: embeddingService.model,
    chunks: chunks.map((c, i) => ({ ...c, embedding: embeddings[i] })),
  });
  return { chunkCount: chunks.length, pageCount: pages.length };
}
