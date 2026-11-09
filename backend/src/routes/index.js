import { Router } from 'express';
import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import documentRoutes from './document.routes.js';
import healthRoutes from './health.routes.js';
import searchRoutes from './search.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/search', searchRoutes);
router.use('/chat', chatRoutes);

export default router;
