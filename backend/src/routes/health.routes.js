import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();
const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', uptime: Math.round(process.uptime()), database: STATES[mongoose.connection.readyState] ?? 'unknown' },
  });
});

export default router;
