import { logger } from '@/lib/logger';
import { StreamingError } from './errors';
import axios from 'axios';

export function handleStreamingError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 503;
    const message = error.response?.data?.message || 'Service temporarily unavailable';
    
    logger.error('Streaming API error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method
    });

    throw new StreamingError(message, 'API_ERROR', status);
  }

  if (error instanceof Error) {
    logger.error('Streaming error:', error);
    throw new StreamingError(
      error.message,
      'STREAMING_ERROR',
      503
    );
  }

  logger.error('Unknown streaming error:', error);
  throw new StreamingError('An unexpected error occurred');
}