import { CorsOptions } from 'cors';
import { allowedOrigins } from './allowedOrigins';
import { logger } from '../logger';
import { corsHeaders } from './headers';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      logger.debug('Request with no origin allowed');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      logger.debug(`Request from allowed origin: ${origin}`);
      return callback(null, true);
    }

    // Log and reject requests from unauthorized origins
    logger.warn(`Request from unauthorized origin rejected: ${origin}`);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: corsHeaders.allowed,
  exposedHeaders: corsHeaders.exposed,
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204,
};