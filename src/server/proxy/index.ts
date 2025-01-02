import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../config/logger';
import { corsOptions } from './config/cors';
import { proxyConfig } from './config';

const app = express();

// Basic security middleware
app.use(helmet());

// CORS middleware with proper configuration
app.use(cors(corsOptions));

// Logging middleware for debugging
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Configure proxy middleware
const proxyMiddleware = createProxyMiddleware({
  target: proxyConfig.targetApi,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding
  },
  onProxyReq: (proxyReq, req) => {
    // Log outgoing proxy request
    logger.debug(`Proxy request: ${req.method} ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req) => {
    // Log proxy response
    logger.debug(`Proxy response: ${proxyRes.statusCode} ${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error('Proxy error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Proxy error occurred',
      code: 'PROXY_ERROR'
    });
  }
});

// Mount proxy middleware
app.use('/api', proxyMiddleware);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Proxy server running on port ${PORT}`);
});

export default app;