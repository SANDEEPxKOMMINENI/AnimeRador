import dotenv from 'dotenv';

dotenv.config();

export const proxyConfig = {
  port: process.env.PROXY_PORT || 3001,
  allowedOrigins: [
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  targetApi: 'https://api.consumet.org/anime',
  rateLimits: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  timeout: 10000, // 10 seconds
};