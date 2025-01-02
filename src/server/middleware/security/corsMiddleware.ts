import cors from 'cors';
import { corsOptions } from '../../config/cors';
import { logger } from '../../config/logger';
import { Request, Response, NextFunction } from 'express';

// Pre-CORS middleware to log all incoming requests
const logRequest = (req: Request, _res: Response, next: NextFunction) => {
  logger.debug('Incoming request:', {
    origin: req.get('origin'),
    method: req.method,
    path: req.path,
  });
  next();
};

// Post-CORS middleware to handle CORS errors
const handleCorsError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message.includes('CORS')) {
    logger.warn('CORS Error:', {
      origin: req.get('origin'),
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
};

export const corsMiddleware = [
  logRequest,
  cors(corsOptions),
  handleCorsError,
];