import { Request, Response, NextFunction } from 'express';
import { corsHeaders } from '../../config/cors/headers';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Apply security headers
  Object.entries(corsHeaders.security).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
};