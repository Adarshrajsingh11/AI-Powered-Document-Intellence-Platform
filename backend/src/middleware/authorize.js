import { ApiError } from '../utils/ApiError.js';

// authorize('admin') -> only users with one of the listed roles may continue
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to do this'));
  }
  return next();
};
