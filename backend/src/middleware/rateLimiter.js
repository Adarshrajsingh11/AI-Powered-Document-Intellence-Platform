import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    message: { success: false, message },
  });

export const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests, please slow down.');
export const authLimiter = make(15 * 60 * 1000, 30, 'Too many login attempts, please try again later.');
export const aiLimiter = make(60 * 1000, 30, 'Too many AI requests, please wait a moment.');
