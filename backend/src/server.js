import fs from 'node:fs/promises';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { startCleanupJob } from './jobs/cleanup.job.js';
import { documentService } from './services/document.service.js';

async function start() {
  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API running on http://localhost:${env.PORT}/api  (LLM: ${env.LLM_PROVIDER}, embeddings: ${env.EMBEDDING_PROVIDER})`);
  });

  await documentService.recoverPending();
  const stopCleanup = startCleanupJob();

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    stopCleanup();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  logger.debug({ err });
  process.exit(1);
});
