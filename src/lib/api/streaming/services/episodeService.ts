import axios from 'axios';
import { logger } from '@/lib/logger';
import { API_CONFIG } from '../config';
import { StreamingError } from '../errors';
import { Episode } from '../types';
import { delay } from '../utils';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchFromSource(url: string, animeId: string): Promise<Episode[]> {
  try {
    const response = await axios.get(url + animeId, {
      timeout: API_CONFIG.TIMEOUT,
      validateStatus: status => status < 500
    });

    // Check if response has episodes
    if (!response.data?.episodes?.length) {
      throw new StreamingError('No episodes found', 'NOT_FOUND', 404);
    }

    return response.data.episodes.map((ep: any): Episode => ({
      id: String(ep.id || ''),
      number: Number(ep.number || 0),
      title: ep.title || undefined,
      image: ep.image || undefined,
      description: ep.description || undefined,
      duration: ep.duration || undefined,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new StreamingError('Request timeout', 'TIMEOUT', 504);
      }
      throw new StreamingError(
        error.response?.status === 404 ? 'Episodes not found' : 'Service unavailable',
        error.response?.status === 404 ? 'NOT_FOUND' : 'SERVICE_ERROR',
        error.response?.status || 503
      );
    }
    throw error;
  }
}

export async function fetchAnimeEpisodes(animeId: string, page: number = 1) {
  logger.info(`Fetching episodes for anime: ${animeId}, page: ${page}`);

  let episodes: Episode[] = [];
  let retryCount = 0;
  let lastError: Error | null = null;

  // Try primary source with retries
  while (retryCount < MAX_RETRIES) {
    try {
      episodes = await fetchFromSource(API_CONFIG.BASE_URL + '/info/', animeId);
      break;
    } catch (error) {
      lastError = error as Error;
      retryCount++;
      logger.warn(`Primary source attempt ${retryCount} failed for anime ${animeId}:`, error);
      
      if (retryCount < MAX_RETRIES) {
        await delay(RETRY_DELAY * retryCount);
        continue;
      }

      // Try fallback source if primary fails
      try {
        logger.info(`Attempting fallback source for anime ${animeId}`);
        episodes = await fetchFromSource(API_CONFIG.FALLBACK_URL + '/info/', animeId);
        break;
      } catch (fallbackError) {
        logger.error(`Fallback source failed for anime ${animeId}:`, fallbackError);
        // Return empty episodes array instead of throwing error
        return {
          episodes: [],
          hasNextPage: false,
          total: 0,
          error: {
            message: 'Episodes temporarily unavailable',
            code: 'SERVICE_ERROR',
            status: 503
          }
        };
      }
    }
  }

  // Paginate results
  const startIdx = (page - 1) * API_CONFIG.EPISODES_PER_PAGE;
  const endIdx = startIdx + API_CONFIG.EPISODES_PER_PAGE;
  const paginatedEpisodes = episodes.slice(startIdx, endIdx);

  return {
    episodes: paginatedEpisodes,
    hasNextPage: endIdx < episodes.length,
    total: episodes.length,
    error: lastError ? {
      message: lastError.message,
      code: (lastError as StreamingError).code || 'ERROR',
      status: (lastError as StreamingError).status || 500
    } : null
  };
}