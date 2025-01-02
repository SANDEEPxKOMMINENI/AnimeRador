import { logger } from '../logger';

export function handleProxyError(error: any) {
  logger.error('Proxy error:', error);

  if (error.code === 'ECONNREFUSED') {
    return {
      status: 503,
      message: 'Service temporarily unavailable'
    };
  }

  if (error.code === 'ETIMEDOUT') {
    return {
      status: 504,
      message: 'Gateway timeout'
    };
  }

  return {
    status: 500,
    message: 'Internal server error'
  };
}