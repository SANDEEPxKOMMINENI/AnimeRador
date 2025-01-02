import { client } from './client';
import { mapEpisodeResponse } from './utils';
import { EpisodeNotFoundError } from './errors';
import type { EpisodeResponse } from './types';
import { EPISODES_PER_PAGE } from './config';

export async function getAnimeEpisodes(animeId: string, page = 1): Promise<EpisodeResponse> {
  try {
    const response = await client.get(`/gogoanime/info/${animeId}`);
    const episodes = response.data.episodes || [];
    
    if (!episodes.length) {
      throw new EpisodeNotFoundError(animeId);
    }
    
    // Paginate episodes
    const startIdx = (page - 1) * EPISODES_PER_PAGE;
    const endIdx = startIdx + EPISODES_PER_PAGE;
    
    return {
      episodes: episodes.slice(startIdx, endIdx).map(mapEpisodeResponse),
      hasNextPage: endIdx < episodes.length,
      total: episodes.length,
    };
  } catch (error) {
    // Let the interceptor handle axios errors
    if (axios.isAxiosError(error)) {
      throw error;
    }
    // Re-throw custom errors
    if (error instanceof StreamingError) {
      throw error;
    }
    // Handle unexpected errors
    throw new StreamingError(
      'Failed to fetch episodes',
      500,
      'UNEXPECTED_ERROR'
    );
  }
}