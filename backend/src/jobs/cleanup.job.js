import fs from 'node:fs/promises';
import { logger } from '../config/logger.js';
import { Chunk } from '../models/Chunk.js';
import { Document } from '../models/Document.js';
import { documentRepository } from '../repositories/document.repository.js';

const HOUR = 60 * 60 * 1000;

export async function runCleanup() {
  // 1) documents stuck in "processing" for 30+ minutes (e.g. server crashed) are marked failed
  const stuck = await documentRepository.findStuck(new Date(Date.now() - 30 * 60 * 1000));
  for (const doc of stuck) {
    await documentRepository.update(doc.id, { status: 'failed', error: 'Processing timed out' });
  }

  // 2) chunks whose document no longer exists
  const chunkDocIds = await Chunk.distinct('document');
  if (chunkDocIds.length) {
    const existing = new Set((await Document.find({ _id: { $in: chunkDocIds } }).select('_id')).map((d) => String(d._id)));
    const orphans = chunkDocIds.filter((id) => !existing.has(String(id)));
    if (orphans.length) await Chunk.deleteMany({ document: { $in: orphans } });
  }
  return { stuck: stuck.length };
}

export function startCleanupJob() {
  const timer = setInterval(() => {
    runCleanup().catch((err) => logger.error({ err }, 'Cleanup job failed'));
  }, HOUR);
  timer.unref();
  return () => clearInterval(timer);
}

// exported for completeness (not used yet): removes a file without throwing
export const safeRemoveFile = (filePath) => fs.rm(filePath, { force: true }).catch(() => {});
