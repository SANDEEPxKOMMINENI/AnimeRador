import { CorsOptions } from 'cors';
import { logger } from '../../config/logger';

// Get allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

// Enhanced CORS options with better error handling and logging
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
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Export helper function to validate origins
export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};