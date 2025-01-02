import { ProviderManager } from './providers/providerManager';
import { logger } from '@/lib/logger';
import type { Episode } from './types';

export async function fetchEpisodes(animeId: string, page: number = 1) {
  try {
    return await ProviderManager.getEpisodes(animeId, page);
  } catch (error) {
    logger.error('Failed to fetch episodes:', error);
    throw error;
  }
}