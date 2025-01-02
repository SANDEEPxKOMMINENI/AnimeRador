import { Router } from 'express';
import { logger } from '@/lib/logger';

const router = Router();

router.get('/', (_req, res) => {
  logger.info('Root route accessed');
  res.json({
    status: 'success',
    message: 'AnimeRadar API',
    version: '1.0.0',
    endpoints: ['/api/streaming', '/api/auth']
  });
});

export default router;