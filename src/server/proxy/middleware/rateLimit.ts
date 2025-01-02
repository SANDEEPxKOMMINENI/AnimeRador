import rateLimit from 'express-rate-limit';
import { proxyConfig } from '../config';

export const rateLimiter = rateLimit({
  windowMs: proxyConfig.rateLimits.windowMs,
  max: proxyConfig.rateLimits.max,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});