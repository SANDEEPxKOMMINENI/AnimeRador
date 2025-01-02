import { logger } from '../logger';

export const proxyConfig = {
  target: 'http://localhost:5000',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  endpoints: {
    streaming: '/api/streaming',
    auth: '/api/auth'
  }
};

export function handleProxyError(error: any) {
  if (error.code === 'ECONNREFUSED') {
    logger.error('Backend connection failed:', {
      code: error.code,
      address: error.address,
      port: error.port
    });
    return {
      status: 503,
      message: 'Backend service unavailable'
    };
  }
  return {
    status: 500,
    message: 'Internal proxy error'
  };
}