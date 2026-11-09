import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

// validateRequest({ body: schema, query: schema, params: schema })
export const validateRequest = (schemas) => (req, res, next) => {
  try {
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) req[key] = schemas[key].parse(req[key] ?? {});
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      const first = details[0];
      const message = first?.field ? `${first.field}: ${first.message}` : first?.message || 'Validation failed';
      return next(new ApiError(400, message, details));
    }
    return next(err);
  }
};
