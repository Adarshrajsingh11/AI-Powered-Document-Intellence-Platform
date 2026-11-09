import { Router } from 'express';
import { getConversation, listConversations, send } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { conversationIdParams, sendMessageSchema } from '../validators/chat.validator.js';

const router = Router();
router.use(authenticate);

router.post('/', aiLimiter, validateRequest({ body: sendMessageSchema }), send);
router.get('/conversations', listConversations);
router.get('/conversations/:id', validateRequest({ params: conversationIdParams }), getConversation);

export default router;
