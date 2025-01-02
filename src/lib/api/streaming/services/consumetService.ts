import axios from 'axios';
import { API_CONFIG } from '../config';
import { StreamingError } from '../errors';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '../types';

const client = axios.create({
  baseURL: 'https://api.consumet.org/anime',
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export async function fetchAnimeInfo(animeId: string) {
  try {
    const response = await client.get(`/gogoanime/info/${animeId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new StreamingError(
          'Anime not found',
          'NOT_FOUND',
          404
        );
      }
      throw new StreamingError(
        'Failed to fetch anime info',
        'API_ERROR',
        error.response?.status || 500
      );
    }
    throw error;
  }
}

export async function fetchEpisodeInfo(episodeId: string) {
  try {
    const response = await client.get(`/gogoanime/watch/${episodeId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new StreamingError(
          'Episode not found',
          'NOT_FOUND',
          404
        );
      }
      throw new StreamingError(
        'Failed to fetch episode info',
        'API_ERROR',
        error.response?.status || 500
      );
    }
    throw error;
  }
}