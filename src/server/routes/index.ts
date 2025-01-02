import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimiter';
import authRoutes from './auth';
import streamingRoutes from './streaming';
import { healthCheck } from '../controllers/health';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// API rate limiting
router.use('/', apiLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/streaming', streamingRoutes);

export default router;