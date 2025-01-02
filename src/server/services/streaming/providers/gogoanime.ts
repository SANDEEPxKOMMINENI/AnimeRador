import { BaseProvider } from './base';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '@/types';

export class GogoAnimeProvider extends BaseProvider {
  name = 'GOGOANIME';

  constructor() {
    super('https://api.consumet.org/anime/gogoanime');
  }

  async getEpisodes(animeId: string): Promise<Episode[]> {
    try {
      const data = await this.request(`/info/${animeId}`);
      
      if (!data?.episodes?.length) {
        logger.warn(`${this.name}: No episodes found for anime ${animeId}`);
        return [];
      }

      return data.episodes.map((ep: any) => ({
        id: String(ep.id),
        number: Number(ep.number),
        title: ep.title || `Episode ${ep.number}`,
        image: ep.image || undefined,
      }));
    } catch (error) {
      logger.error(`${this.name}: Failed to fetch episodes`, {
        animeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getStreamingSources(episodeId: string): Promise<StreamingData> {
    try {
      const data = await this.request(`/watch/${episodeId}`);
      
      if (!data?.sources?.length) {
        logger.warn(`${this.name}: No streaming sources found for episode ${episodeId}`);
        throw new Error('No streaming sources found');
      }

      return {
        sources: data.sources.map((source: any) => ({
          url: String(source.url),
          quality: String(source.quality),
          isM3U8: Boolean(source.isM3U8),
        })),
        subtitles: (data.subtitles || []).map((sub: any) => ({
          url: String(sub.url),
          lang: String(sub.lang),
        })),
        headers: data.headers,
      };
    } catch (error) {
      logger.error(`${this.name}: Failed to fetch streaming sources`, {
        episodeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}