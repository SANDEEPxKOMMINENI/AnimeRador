import { fetchEpisodesFromGogoanime, fetchStreamingFromGogoanime } from './gogoanime';
import { logger } from '@/lib/logger';
import { StreamingError } from '../errors';
import type { StreamingSource, Episode } from '../types';

export async function getStreamingSources(episodeId: string): Promise<{
  sources: StreamingSource[];
  provider: string;
}> {
  try {
    logger.info(`Fetching streaming sources for episode: ${episodeId}`);
    const data = await fetchStreamingFromGogoanime(episodeId);
    
    return {
      sources: data.sources,
      provider: 'gogoanime'
    };
  } catch (error) {
    logger.error('Failed to fetch streaming sources:', error);
    throw error;
  }
}

export async function getEpisodesList(animeId: string) {
  try {
    logger.info(`Fetching episodes for anime: ${animeId}`);
    const episodes = await fetchEpisodesFromGogoanime(animeId);
    
    return {
      episodes,
      provider: 'gogoanime',
      hasNextPage: false,
      total: episodes.length
    };
  } catch (error) {
    logger.error('Failed to fetch episodes:', error);
    throw error;
  }
}