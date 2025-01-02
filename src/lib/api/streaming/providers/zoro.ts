import axios from 'axios';
import { logger } from '@/lib/logger';
import type { StreamingData, EpisodesResponse } from '../types';

const client = axios.create({
  baseURL: 'https://api.consumet.org/anime/zoro',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'AnimeRadar/1.0'
  }
});

export async function fetchEpisodes(animeId: string): Promise<EpisodesResponse> {
  try {
    logger.info(`Fetching episodes from Zoro for anime: ${animeId}`);
    
    const response = await client.get(`/info/${animeId}`);
    
    if (!response.data?.episodes?.length) {
      throw new Error('No episodes found');
    }

    return {
      episodes: response.data.episodes.map((ep: any) => ({
        id: String(ep.id),
        number: Number(ep.number),
        title: ep.title || `Episode ${ep.number}`,
        image: ep.image || undefined,
      })),
      hasNextPage: false,
      total: response.data.episodes.length,
      provider: 'zoro'
    };
  } catch (error) {
    logger.error('Zoro episodes fetch failed:', error);
    throw error;
  }
}

export async function fetchStreamingSources(episodeId: string): Promise<StreamingData> {
  try {
    logger.info(`Fetching streaming sources from Zoro for episode: ${episodeId}`);
    
    const response = await client.get(`/watch/${episodeId}`);
    
    if (!response.data?.sources?.length) {
      throw new Error('No streaming sources found');
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
      headers: response.data.headers,
      provider: 'zoro'
    };
  } catch (error) {
    logger.error('Zoro streaming sources fetch failed:', error);
    throw error;
  }
}