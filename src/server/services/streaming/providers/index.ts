import { GogoAnimeProvider } from './gogoanime';
import { logger } from '@/lib/logger';

export class StreamingService {
  private providers = [
    new GogoAnimeProvider(),
  ];

  async getEpisodes(animeId: string) {
    logger.info(`Fetching episodes for anime: ${animeId}`);

    for (const provider of this.providers) {
      try {
        const episodes = await provider.getEpisodes(animeId);
        if (episodes.length > 0) {
          return { episodes, provider: provider.name };
        }
      } catch (error) {
        logger.error(`${provider.name} failed:`, error);
        continue;
      }
    }

    return {
      episodes: [],
      error: {
        message: 'Episodes temporarily unavailable',
        code: 'PROVIDERS_UNAVAILABLE'
      }
    };
  }

  async getStreamingSources(episodeId: string) {
    logger.info(`Fetching streaming sources for episode: ${episodeId}`);

    for (const provider of this.providers) {
      try {
        const sources = await provider.getStreamingSources(episodeId);
        if (sources.sources.length > 0) {
          return { ...sources, provider: provider.name };
        }
      } catch (error) {
        logger.error(`${provider.name} streaming failed:`, error);
        continue;
      }
    }

    throw {
      message: 'Streaming sources temporarily unavailable',
      code: 'PROVIDERS_UNAVAILABLE',
      status: 503
    };
  }
}

export const streamingService = new StreamingService();