import { logger } from '@/lib/logger';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry = () => {},
    shouldRetry = () => true
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }

      const delayMs = retryDelay * attempt;
      logger.debug(`Retry attempt ${attempt}/${maxRetries}. Waiting ${delayMs}ms`);
      onRetry(attempt, error);
      await delay(delayMs);
    }
  }

  throw lastError;
}