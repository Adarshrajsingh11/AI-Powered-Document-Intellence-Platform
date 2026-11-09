import { logger } from '../config/logger.js';
import { runDocumentIngestion } from '../jobs/documentIngestion.job.js';

// Small in-process queue: uploads return immediately and ingestion runs in the background.
// To scale out later, replace this file with BullMQ/Redis and keep the same enqueue() call.
const CONCURRENCY = 2;
const waiting = [];
const queued = new Set();
let running = 0;

function drain() {
  while (running < CONCURRENCY && waiting.length) {
    const id = waiting.shift();
    running += 1;
    runDocumentIngestion(id)
      .catch((err) => logger.error({ err, documentId: id }, 'Queue job crashed'))
      .finally(() => {
        running -= 1;
        queued.delete(id);
        drain();
      });
  }
}

export const documentQueue = {
  enqueue(documentId) {
    const id = String(documentId);
    if (queued.has(id)) return;
    queued.add(id);
    waiting.push(id);
    setImmediate(drain);
  },
  size: () => waiting.length + running,
};
