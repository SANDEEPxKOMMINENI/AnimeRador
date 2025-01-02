import { logger } from '@/lib/logger';
import { StreamingError } from '../errors';
import { STREAMING_CONFIG } from '../config';
import { PrimaryProvider } from './primaryProvider';
import { BackupProvider } from './backupProvider';
import type { StreamingProvider } from '../types';

export class ProviderManager {
  private static providers: StreamingProvider[] = [
    new PrimaryProvider(),
    new BackupProvider()
  ];

  static async getEpisodes(animeId: string, page: number = 1) {
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        logger.info(`Attempting to fetch episodes from ${provider.name}`);
        const result = await provider.getEpisodes(animeId, page);
        
        if (result.episodes.length > 0) {
          return {
            ...result,
            provider: provider.name
          };
        }
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    throw new StreamingError(
      'All streaming providers failed',
      'PROVIDERS_UNAVAILABLE',
      503
    );
  }
}