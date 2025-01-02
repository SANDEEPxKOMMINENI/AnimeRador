import { createHttpClient } from '../utils/http';
import { PROVIDER_URLS, PROVIDER_CONFIG } from '../config/providers';
import { StreamingError } from '../errors';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '../types';

const client = createHttpClient(PROVIDER_URLS.GOGOANIME);

export async function fetchEpisodesFromGogoanime(animeId: string): Promise<Episode[]> {
  try {
    logger.info(`Fetching episodes from GogoAnime for anime: ${animeId}`);
    
    const response = await client.get(`/anime/${animeId}`);
    
    if (!response.data?.episodes?.length) {
      throw new StreamingError('No episodes found', 'NOT_FOUND', 404);
    }

    return response.data.episodes.map((ep: any): Episode => ({
      id: String(ep.id),
      number: Number(ep.number),
      title: `Episode ${ep.number}`,
      image: ep.image || undefined,
    }));

  } catch (error) {
    // Try backup provider if main fails
    logger.warn('GogoAnime fetch failed, trying backup provider');
    return fetchFromBackup(animeId);
  }
}

export async function fetchStreamingFromGogoanime(episodeId: string): Promise<StreamingData> {
  try {
    logger.info(`Fetching streaming data for episode: ${episodeId}`);
    
    const response = await client.get(`/watch/${episodeId}`);
    
    if (!response.data?.sources?.length) {
      throw new StreamingError('No streaming sources found', 'NOT_FOUND', 404);
    }

    return {
      sources: response.data.sources.map((source: any) => ({
        url: String(source.url),
        quality: String(source.quality),
        isM3U8: Boolean(source.isM3U8),
      })),
      subtitles: (response.data.subtitles || []).map((sub: any) => ({
        url: String(sub.url),
        lang: String(sub.lang),
      })),
    };
  } catch (error) {
    logger.error('Streaming fetch failed:', error);
    throw new StreamingError(
      'Failed to fetch streaming data',
      'SERVICE_ERROR',
      503
    );
  }
}

async function fetchFromBackup(animeId: string): Promise<Episode[]> {
  const backupClient = createHttpClient(PROVIDER_URLS.BACKUP);
  
  try {
    const response = await backupClient.get(`/anime/${animeId}/episodes`);
    
    if (!response.data?.episodes?.length) {
      throw new StreamingError('No episodes found', 'NOT_FOUND', 404);
    }

    return response.data.episodes.map((ep: any): Episode => ({
      id: String(ep.id),
      number: Number(ep.number),
      title: `Episode ${ep.number}`,
      image: ep.image || undefined,
    }));
  } catch (error) {
    logger.error('Backup provider also failed:', error);
    throw new StreamingError(
      'Failed to fetch episodes from all providers',
      'SERVICE_ERROR',
      503
    );
  }
}