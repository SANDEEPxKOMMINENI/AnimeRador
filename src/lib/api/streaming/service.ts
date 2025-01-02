import { logger } from '@/lib/logger';
import * as consumetProvider from './providers/consumet';
import * as zoroProvider from './providers/zoro';
import type { StreamingData, EpisodesResponse } from './types';

export async function getEpisodes(animeId: string): Promise<EpisodesResponse> {
  // Try primary provider (Consumet)
  try {
    return await consumetProvider.fetchEpisodes(animeId);
  } catch (error) {
    logger.warn('Primary provider failed, trying backup');
  }

  // Try backup provider (Zoro)
  try {
    return await zoroProvider.fetchEpisodes(animeId);
  } catch (error) {
    logger.error('All providers failed to fetch episodes');
    throw new Error('Failed to fetch episodes from all providers');
  }
}

export async function getStreamingSources(episodeId: string): Promise<StreamingData> {
  // Try primary provider (Consumet)
  try {
    return await consumetProvider.fetchStreamingSources(episodeId);
  } catch (error) {
    logger.warn('Primary streaming provider failed, trying backup');
  }

  // Try backup provider (Zoro)
  try {
    return await zoroProvider.fetchStreamingSources(episodeId);
  } catch (error) {
    logger.error('All providers failed to fetch streaming sources');
    throw new Error('Failed to fetch streaming sources from all providers');
  }
}