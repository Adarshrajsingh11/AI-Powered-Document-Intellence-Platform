import { Router } from 'express';
import { search } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { searchSchema } from '../validators/chat.validator.js';

const router = Router();
router.use(authenticate);

router.post('/', aiLimiter, validateRequest({ body: searchSchema }), search);

export default router;
