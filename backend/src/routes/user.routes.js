import { Router } from 'express';
import { getMe, updateMe } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();
router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', validateRequest({ body: updateProfileSchema }), updateMe);

export default router;
