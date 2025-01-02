import { logger } from '@/lib/logger';
import { GogoAnimeProvider } from './providers/gogoanime';
import { withRetry } from './utils/retry';
import { validateStreamingSources } from './utils/validation';
import type { Episode, StreamingData } from '@/types';

export class StreamingService {
  private providers = [
    new GogoAnimeProvider(),
    // Add more providers here
  ];

  async getEpisodes(animeId: string): Promise<{
    episodes: Episode[];
    provider?: string;
    error?: { message: string; code: string; };
  }> {
    logger.info(`Fetching episodes for anime: ${animeId}`);

    for (const provider of this.providers) {
      try {
        const episodes = await withRetry(
          () => provider.getEpisodes(animeId),
          {
            onRetry: (attempt, error) => {
              logger.warn(`${provider.name} attempt ${attempt} failed:`, error);
            }
          }
        );

        if (episodes.length > 0) {
          return { episodes, provider: provider.name };
        }
      } catch (error) {
        logger.error(`${provider.name} failed to fetch episodes:`, error);
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

  async getStreamingSources(episodeId: string): Promise<StreamingData> {
    logger.info(`Fetching streaming sources for episode: ${episodeId}`);

    for (const provider of this.providers) {
      try {
        const data = await withRetry(
          () => provider.getStreamingSources(episodeId),
          {
            onRetry: (attempt, error) => {
              logger.warn(`${provider.name} attempt ${attempt} failed:`, error);
            }
          }
        );

        // Validate streaming sources
        const validSources = await validateStreamingSources(data.sources);
        if (validSources.length > 0) {
          return {
            ...data,
            sources: validSources,
            provider: provider.name
          };
        }
      } catch (error) {
        logger.error(`${provider.name} failed to fetch streaming sources:`, error);
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

// Export singleton instance
export const streamingService = new StreamingService();