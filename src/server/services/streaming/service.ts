import { logger } from '@/lib/logger';
import { providers } from './providers';
import { tryProvider } from './utils';
import type { ProviderResponse } from './types';
import type { Episode, StreamingData } from '@/types';

export async function getEpisodes(animeId: string): Promise<ProviderResponse<Episode[]>> {
  logger.info(`Fetching episodes for anime: ${animeId}`);

  for (const provider of providers) {
    try {
      const episodes = await tryProvider(provider, () => 
        provider.getEpisodes(animeId)
      );

      return {
        data: episodes,
        provider: provider.constructor.name,
      };
    } catch (error) {
      logger.error(`${provider.constructor.name} failed:`, error);
      continue;
    }
  }

  return {
    data: [],
    provider: 'none',
    error: {
      message: 'Episodes temporarily unavailable',
      code: 'PROVIDERS_UNAVAILABLE',
      status: 503
    }
  };
}

export async function getStreamingSources(episodeId: string): Promise<ProviderResponse<StreamingData>> {
  logger.info(`Fetching streaming sources for episode: ${episodeId}`);

  for (const provider of providers) {
    try {
      const streamingData = await tryProvider(provider, () =>
        provider.getStreamingSources(episodeId)
      );

      return {
        data: streamingData,
        provider: provider.constructor.name,
      };
    } catch (error) {
      logger.error(`${provider.constructor.name} streaming failed:`, error);
      continue;
    }
  }

  throw {
    message: 'Streaming sources temporarily unavailable',
    code: 'PROVIDERS_UNAVAILABLE',
    status: 503
  };
}