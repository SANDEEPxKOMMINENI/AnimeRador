import { Request, Response } from 'express';
import { logger } from '../config/logger';

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.url,
  });
};