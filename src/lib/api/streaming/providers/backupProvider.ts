import axios from 'axios';
import { STREAMING_CONFIG } from '../config';
import { StreamingError } from '../errors';
import { withRetry } from '../utils/retry';
import { generateFallbackEpisodes } from '../utils/fallback';
import type { Episode } from '@/types';

export class BackupProvider {
  private client = axios.create({
    baseURL: STREAMING_CONFIG.BACKUP_URL,
    timeout: STREAMING_CONFIG.TIMEOUT
  });

  async getEpisodes(animeId: string): Promise<{
    episodes: Episode[];
    hasNextPage: boolean;
    total: number;
  }> {
    try {
      const result = await withRetry(
        () => this.client.get(`/episodes/${animeId}`),
        { name: 'Backup provider episodes fetch' }
      );

      return {
        episodes: result.data.episodes || [],
        hasNextPage: result.data.hasNextPage || false,
        total: result.data.total || 0
      };
    } catch (error) {
      if (STREAMING_CONFIG.FALLBACK_EPISODES.enabled) {
        return {
          episodes: generateFallbackEpisodes(animeId),
          hasNextPage: false,
          total: STREAMING_CONFIG.FALLBACK_EPISODES.count
        };
      }

      throw new StreamingError(
        'Backup streaming service unavailable',
        'SERVICE_ERROR',
        503
      );
    }
  }
}