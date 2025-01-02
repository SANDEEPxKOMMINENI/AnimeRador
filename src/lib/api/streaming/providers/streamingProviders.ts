import { logger } from '@/lib/logger';
import { StreamingError } from '../errors';
import { validateStreamingSources } from '../utils/validation';
import { delay } from '../utils/retry';
import type { StreamingData, Episode } from '../types';

// Base provider class with retry logic
abstract class BaseProvider {
  abstract name: string;
  protected abstract baseUrl: string;
  protected maxRetries = 3;
  protected retryDelay = 1000;

  protected async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AnimeRadar/1.0',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`${this.name} attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          await delay(this.retryDelay * attempt);
          continue;
        }
      }
    }

    throw lastError;
  }

  abstract getEpisodes(animeId: string): Promise<Episode[]>;
  abstract getStreamingSources(episodeId: string): Promise<StreamingData>;
}

// Primary streaming provider
class GogoAnimeProvider extends BaseProvider {
  name = 'gogoanime';
  protected baseUrl = 'https://api.consumet.org/anime/gogoanime';

  async getEpisodes(animeId: string): Promise<Episode[]> {
    try {
      const data = await this.fetchWithRetry(`${this.baseUrl}/info/${animeId}`);

      if (!data?.episodes?.length) {
        throw new StreamingError('No episodes found', 'NOT_FOUND', 404);
      }

      return data.episodes.map((ep: any) => ({
        id: String(ep.id),
        number: Number(ep.number),
        title: ep.title || `Episode ${ep.number}`,
        image: ep.image || undefined,
      }));
    } catch (error) {
      logger.error(`${this.name} episodes fetch failed:`, error);
      throw error;
    }
  }

  async getStreamingSources(episodeId: string): Promise<StreamingData> {
    try {
      const data = await this.fetchWithRetry(`${this.baseUrl}/watch/${episodeId}`);

      if (!data?.sources?.length) {
        throw new StreamingError('No streaming sources found', 'NOT_FOUND', 404);
      }

      const sources = data.sources.map((source: any) => ({
        url: String(source.url),
        quality: String(source.quality),
        isM3U8: Boolean(source.isM3U8),
      }));

      const validSources = await validateStreamingSources(sources);
      if (!validSources.length) {
        throw new StreamingError('No valid streaming sources found', 'INVALID_SOURCES', 404);
      }

      return {
        sources: validSources,
        subtitles: (data.subtitles || []).map((sub: any) => ({
          url: String(sub.url),
          lang: String(sub.lang),
        })),
        headers: data.headers,
      };
    } catch (error) {
      logger.error(`${this.name} streaming sources fetch failed:`, error);
      throw error;
    }
  }
}

// Backup streaming provider
class ZoroProvider extends BaseProvider {
  name = 'zoro';
  protected baseUrl = 'https://api.consumet.org/anime/zoro';

  async getEpisodes(animeId: string): Promise<Episode[]> {
    try {
      const data = await this.fetchWithRetry(`${this.baseUrl}/info/${animeId}`);

      if (!data?.episodes?.length) {
        throw new StreamingError('No episodes found', 'NOT_FOUND', 404);
      }

      return data.episodes.map((ep: any) => ({
        id: String(ep.id),
        number: Number(ep.number),
        title: ep.title || `Episode ${ep.number}`,
        image: ep.image || undefined,
      }));
    } catch (error) {
      logger.error(`${this.name} episodes fetch failed:`, error);
      throw error;
    }
  }

  async getStreamingSources(episodeId: string): Promise<StreamingData> {
    try {
      const data = await this.fetchWithRetry(`${this.baseUrl}/watch/${episodeId}`);

      if (!data?.sources?.length) {
        throw new StreamingError('No streaming sources found', 'NOT_FOUND', 404);
      }

      const sources = data.sources.map((source: any) => ({
        url: String(source.url),
        quality: String(source.quality),
        isM3U8: Boolean(source.isM3U8),
      }));

      const validSources = await validateStreamingSources(sources);
      if (!validSources.length) {
        throw new StreamingError('No valid streaming sources found', 'INVALID_SOURCES', 404);
      }

      return {
        sources: validSources,
        subtitles: (data.subtitles || []).map((sub: any) => ({
          url: String(sub.url),
          lang: String(sub.lang),
        })),
        headers: data.headers,
      };
    } catch (error) {
      logger.error(`${this.name} streaming sources fetch failed:`, error);
      throw error;
    }
  }
}

// Initialize providers
const providers = [
  new GogoAnimeProvider(),
  new ZoroProvider()
];

// Helper function to try each provider with retries
async function tryProviders<T>(
  operation: (provider: BaseProvider) => Promise<T>,
  errorMessage: string
): Promise<T & { provider: string }> {
  const errors: Error[] = [];

  for (const provider of providers) {
    try {
      logger.info(`Attempting to fetch from ${provider.name}`);
      const result = await operation(provider);
      logger.info(`Successfully fetched from ${provider.name}`);
      return { ...result, provider: provider.name };
    } catch (error) {
      logger.error(`${provider.name} failed:`, error);
      errors.push(error as Error);
      
      // Short delay before trying next provider
      await delay(1000);
      continue;
    }
  }

  // Log detailed error information
  logger.error('All providers failed:', {
    errors: errors.map(e => ({
      provider: e.name,
      message: e.message,
      stack: e.stack
    }))
  });

  throw new StreamingError(
    errorMessage,
    'PROVIDERS_UNAVAILABLE',
    503
  );
}

export async function getStreamingSources(episodeId: string): Promise<StreamingData> {
  return tryProviders(
    (provider) => provider.getStreamingSources(episodeId),
    'Unable to fetch streaming data from any provider'
  );
}

export async function getEpisodesList(animeId: string) {
  const result = await tryProviders(
    async (provider) => {
      const episodes = await provider.getEpisodes(animeId);
      return {
        episodes,
        hasNextPage: false,
        total: episodes.length
      };
    },
    'Unable to fetch episodes from any provider'
  );

  return result;
}