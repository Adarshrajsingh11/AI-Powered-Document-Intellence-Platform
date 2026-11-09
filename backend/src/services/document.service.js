import fs from 'node:fs/promises';
import { ai } from '../config/ai.js';
import { logger } from '../config/logger.js';
import { documentRepository } from '../repositories/document.repository.js';
import { documentQueue } from '../queues/document.queue.js';
import { ApiError } from '../utils/ApiError.js';
import { fixFileName } from '../utils/fileValidation.js';

export const documentService = {
  async upload(user, file) {
    if (!file) throw new ApiError(400, 'No file uploaded (use the "file" field)');
    const document = await documentRepository.create({
      owner: user.id,
      originalName: fixFileName(file.originalname),
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path,
      status: 'uploaded',
    });
    documentQueue.enqueue(document.id); // processed in the background
    return document;
  },

  list: (user) => documentRepository.listByOwner(user.id),

  async get(user, id) {
    const document = await documentRepository.findByIdForOwner(id, user.id);
    if (!document) throw new ApiError(404, 'Document not found');
    return document;
  },

  async remove(user, id) {
    const document = await this.get(user, id);
    await ai.vectorStore.deleteByDocument(document.id);
    await documentRepository.deleteById(document.id);
    await fs.rm(document.storagePath, { force: true }).catch((err) => logger.warn({ err }, 'Could not delete file'));
  },

  // After a restart, pick up documents that were still waiting or being processed.
  async recoverPending() {
    const pending = await documentRepository.findPending();
    pending.forEach((d) => documentQueue.enqueue(d.id));
    if (pending.length) logger.info(`Re-queued ${pending.length} unfinished document(s)`);
  },
};
