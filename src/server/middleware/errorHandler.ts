import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/logger';
import { StreamingError } from '@/lib/api/streaming/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err instanceof StreamingError) {
    return res.status(err.status).json({
      status: 'error',
      code: err.code,
      message: err.message
    });
  }

  // Handle other specific error types here

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}