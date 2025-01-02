import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { corsMiddleware, securityHeaders } from '../middleware/security';
import { helmetOptions } from './security';
import { sessionConfig } from '../utils/session';
import { logger } from './logger';
import { errorHandler } from '../middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet(helmetOptions));
  app.use(corsMiddleware);
  app.use(securityHeaders);

  // Basic middleware
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser(process.env.SESSION_SECRET));
  app.use(session(sessionConfig));

  // Request logging
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
    skip: (req) => req.url === '/health' || req.url === '/favicon.ico',
  }));

  // Error handling
  app.use(errorHandler);

  return app;
}