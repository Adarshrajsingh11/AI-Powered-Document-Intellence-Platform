import { ai } from '../config/ai.js';
import { logger } from '../config/logger.js';
import { documentRepository } from '../repositories/document.repository.js';

// Reads the uploaded file, extracts text, chunks it, embeds it and stores the vectors.
export async function runDocumentIngestion(documentId) {
  const doc = await documentRepository.findById(documentId);
  if (!doc) return; // deleted before it was processed

  await documentRepository.update(doc.id, { status: 'processing', error: null });
  try {
    const { chunkCount } = await ai.ingestDocument({
      filePath: doc.storagePath,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      ownerId: String(doc.owner),
      documentId: doc.id,
    });

    // The user may have deleted the document while it was processing
    if (!(await documentRepository.findById(doc.id))) {
      await ai.vectorStore.deleteByDocument(doc.id);
      return;
    }
    await documentRepository.update(doc.id, { status: 'ready', chunkCount, error: null });
    logger.info({ documentId: doc.id, chunkCount }, 'Document ingested');
  } catch (err) {
    logger.error({ err, documentId: doc.id }, 'Document ingestion failed');
    await documentRepository.update(doc.id, { status: 'failed', error: String(err.message).slice(0, 300) });
  }
}
