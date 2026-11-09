import { ZodError } from 'zod';
import multer from 'multer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

// Express recognises error handlers by their 4 arguments, so keep `next` even though it is unused.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = err.message || 'Internal server error';
  let details;

  if (err instanceof ApiError) {
    status = err.statusCode;
    details = err.details;
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? `File too large (max ${env.MAX_FILE_SIZE_MB} MB)` : err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  } else if (err.code === 11000) {
    status = 409;
    message = 'This resource already exists';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  }

  if (status >= 500) {
    logger.error({ err, method: req.method, path: req.originalUrl }, 'Unhandled error');
    if (env.NODE_ENV === 'production') message = 'Internal server error';
  }

  res.status(status).json({ success: false, message, errors: details });
}
