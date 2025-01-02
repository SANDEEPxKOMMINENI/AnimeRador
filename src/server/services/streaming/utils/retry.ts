import { logger } from '@/lib/logger';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: any) => void;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry = () => {}
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }

      const delay = retryDelay * attempt;
      logger.debug(`Retry attempt ${attempt}/${maxRetries}. Waiting ${delay}ms`);
      onRetry(attempt, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}