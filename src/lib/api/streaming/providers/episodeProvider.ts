import axios from 'axios';
import { PROVIDER_CONFIG } from './config';
import { withRetry } from '../utils/retry';
import { logger } from '@/lib/logger';
import type { Episode } from '../types';

export async function fetchEpisodesFromProvider(
  provider: string,
  baseUrl: string,
  animeId: string
): Promise<Episode[]> {
  const response = await axios.get(`${baseUrl}/anime/${animeId}/episodes`, {
    timeout: PROVIDER_CONFIG.TIMEOUT,
    headers: {
      'User-Agent': 'AnimeRadar/1.0'
    }
  });

  if (!response.data?.episodes?.length) {
    throw new Error('No episodes found');
  }

  return response.data.episodes.map((ep: any) => ({
    id: String(ep.id || ep.episodeId || `${animeId}-${ep.number}`),
    number: Number(ep.number || ep.episodeNumber),
    title: ep.title || `Episode ${ep.number}`,
    image: ep.image || ep.thumbnail || `${PROVIDER_CONFIG.FALLBACK_CDN}/thumbnails/${animeId}/${ep.number}.jpg`
  }));
}

export async function getFallbackEpisodes(animeId: string): Promise<Episode[]> {
  for (const [provider, baseUrl] of Object.entries(PROVIDER_CONFIG.PROVIDERS)) {
    try {
      return await withRetry(
        () => fetchEpisodesFromProvider(provider, baseUrl, animeId),
        {
          maxRetries: PROVIDER_CONFIG.MAX_RETRIES,
          retryDelay: PROVIDER_CONFIG.RETRY_DELAY,
          operationName: `Fetching episodes from ${provider}`
        }
      );
    } catch (error) {
      logger.warn(`Provider ${provider} failed to fetch episodes:`, error);
      continue;
    }
  }

  logger.warn('All providers failed, using fallback episodes');
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${animeId}-${i + 1}`,
    number: i + 1,
    title: `Episode ${i + 1}`,
    image: `${PROVIDER_CONFIG.FALLBACK_CDN}/thumbnails/${animeId}/${i + 1}.jpg`
  }));
}