import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { sessionConfig } from '../utils/session';
import { logger } from '../config/logger';

export const sessionMiddleware = session(sessionConfig);

export const sessionErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'SessionError') {
    logger.error('Session error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Session error occurred',
      code: 'SESSION_ERROR'
    });
  }
  next(err);
};

export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    logger.error('Session middleware not properly initialized');
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SESSION_NOT_INITIALIZED'
    });
  }
  next();
};