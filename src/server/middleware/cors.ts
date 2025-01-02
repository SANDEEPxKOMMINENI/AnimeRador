import cors from 'cors';
import { corsConfig } from '../config/cors';
import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = [
  // Pre-flight handler
  (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      return res.status(200).end();
    }
    next();
  },
  
  // Main CORS handler
  cors(corsConfig)
];