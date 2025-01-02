import { logger } from '@/lib/logger';
import type { StreamingProvider } from './types';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function tryProvider<T>(
  provider: StreamingProvider,
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempting ${provider.constructor.name} (try ${attempt}/${maxRetries})`);
      const result = await operation();
      logger.info(`${provider.constructor.name} succeeded`);
      return result;
    } catch (error: any) {
      lastError = error;
      logger.warn(`${provider.constructor.name} attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        await delay(retryDelay * attempt);
      }
    }
  }

  throw lastError;
}