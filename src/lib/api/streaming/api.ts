import axios from 'axios';
import { StreamingError } from './errors';
import { logger } from '@/lib/logger';
import type { Episode, StreamingSource, Subtitle } from './types';

const CONSUMET_API = 'https://api.consumet.org/anime';

export async function getAnimeEpisodes(animeId: string, page = 1): Promise<{
  episodes: Episode[];
  hasNextPage: boolean;
}> {
  try {
    const response = await axios.get(`${CONSUMET_API}/gogoanime/info/${animeId}`);
    const episodes = response.data.episodes || [];
    
    // Paginate episodes (50 per page)
    const startIdx = (page - 1) * 50;
    const endIdx = startIdx + 50;
    
    // Ensure we only return serializable data
    const serializedEpisodes = episodes.slice(startIdx, endIdx).map((ep: any) => ({
      id: String(ep.id),
      number: Number(ep.number),
      title: ep.title || undefined,
      image: ep.image || undefined,
      description: ep.description || undefined,
      duration: ep.duration || undefined,
    }));

    return {
      episodes: serializedEpisodes,
      hasNextPage: endIdx < episodes.length
    };
  } catch (error) {
    logger.error('Error fetching episodes:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      animeId,
      page
    });
    throw new StreamingError('Failed to fetch episodes');
  }
}

export async function getEpisodeStreaming(episodeId: string): Promise<{
  sources: StreamingSource[];
  subtitles: Subtitle[];
}> {
  try {
    const response = await axios.get(`${CONSUMET_API}/gogoanime/watch/${episodeId}`);
    
    // Ensure we only return serializable data
    return {
      sources: (response.data.sources || []).map((source: any) => ({
        url: String(source.url || ''),
        quality: String(source.quality || ''),
        isM3U8: Boolean(source.isM3U8)
      })),
      subtitles: (response.data.subtitles || []).map((sub: any) => ({
        url: String(sub.url || ''),
        lang: String(sub.lang || '')
      }))
    };
  } catch (error) {
    logger.error('Error fetching streaming data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      episodeId
    });
    throw new StreamingError('Failed to fetch streaming data');
  }
}