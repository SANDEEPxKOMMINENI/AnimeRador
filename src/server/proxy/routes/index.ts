import { Router } from 'express';
import { ProxyController } from '../controllers/proxyController';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

// Apply rate limiting to all proxy routes
router.use(rateLimiter);

// Handle all proxy requests
router.all('/*', ProxyController.handleRequest);

export default router;