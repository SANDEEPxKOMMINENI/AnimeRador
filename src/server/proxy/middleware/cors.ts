import cors from 'cors';
import { proxyConfig } from '../config';
import { logger } from '../../config/logger';
import { Request, Response, NextFunction } from 'express';

// Enhanced CORS middleware with better error handling
export const corsMiddleware = [
  // Pre-flight request handler
  (req: Request, res: Response, next: NextFunction) => {
    // Always allow OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(200).end();
    }
    next();
  },
  
  // Main CORS handler
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = proxyConfig.allowedOrigins;
      
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        logger.debug('Request with no origin allowed');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        logger.debug(`Request from allowed origin: ${origin}`);
        return callback(null, true);
      }

      logger.warn(`Request from unauthorized origin blocked: ${origin}`);
      callback(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  }),

  // Error handler for CORS issues
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.message.includes('CORS')) {
      logger.error('CORS Error:', {
        origin: req.headers.origin,
        method: req.method,
        path: req.path,
      });
      
      return res.status(403).json({
        status: 'error',
        code: 'CORS_ERROR',
        message: 'Cross-Origin Request Blocked',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
    next(err);
  }
];