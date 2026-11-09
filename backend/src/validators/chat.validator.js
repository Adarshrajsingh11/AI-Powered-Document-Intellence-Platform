import { z } from 'zod';
import { objectId } from './document.validator.js';

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
  conversationId: objectId.nullish(),
  documentIds: z.array(objectId).max(50).default([]),
});

export const searchSchema = z.object({
  query: z.string().trim().min(1, 'Query cannot be empty').max(500),
  documentIds: z.array(objectId).max(50).default([]),
  topK: z.coerce.number().int().min(1).max(20).default(8),
});

export const conversationIdParams = z.object({ id: objectId });
