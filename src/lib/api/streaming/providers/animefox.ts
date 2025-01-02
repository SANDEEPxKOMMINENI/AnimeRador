```typescript
import axios from 'axios';
import { StreamingError } from '../errors';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '../types';

const BASE_URL = 'https://animefox.tv/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'User-Agent': 'AnimeRadar/1.0',
  },
});

export async function fetchEpisodesFromAnimeFox(animeId: string): Promise<Episode[]> {
  try {
    logger.info(`Fetching episodes from AnimeFox for anime: ${animeId}`);
    
    const response = await client.get(`/anime/${animeId}/episodes`);
    
    if (!response.data?.episodes?.length) {
      throw new StreamingError('No episodes found', 'NOT_FOUND', 404);
    }

    return response.data.episodes.map((ep: any): Episode => ({
      id: String(ep.id),
      number: Number(ep.number),
      title: ep.title || undefined,
      image: ep.thumbnail || undefined,
    }));
  } catch (error) {
    logger.error('AnimeFox fetch error:', error);
    throw new StreamingError(
      'Failed to fetch episodes from AnimeFox',
      'SERVICE_ERROR',
      503
    );
  }
}

export async function fetchStreamingFromAnimeFox(episodeId: string): Promise<StreamingData> {
  try {
    logger.info(`Fetching streaming data from AnimeFox for episode: ${episodeId}`);
    
    const response = await client.get(`/episode/${episodeId}/sources`);
    
    if (!response.data?.sources?.length) {
      throw new StreamingError('No streaming sources found', 'NOT_FOUND', 404);
    }

    return {
      sources: response.data.sources.map((source: any) => ({
        url: source.file,
        quality: source.label,
        isM3U8: source.type === 'hls',
      })),
      subtitles: response.data.subtitles?.map((sub: any) => ({
        url: sub.file,
        lang: sub.label,
      })) || [],
    };
  } catch (error) {
    logger.error('AnimeFox streaming error:', error);
    throw new StreamingError(
      'Failed to fetch streaming data from AnimeFox',
      'SERVICE_ERROR',
      503
    );
  }
}
```