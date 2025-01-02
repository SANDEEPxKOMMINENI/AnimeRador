import axios from 'axios';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '@/types';

// Using Consumet API as the primary source with multiple providers
const PROVIDERS = {
  GOGOANIME: 'https://api.consumet.org/anime/gogoanime',
  ZORO: 'https://api.consumet.org/anime/zoro',
  ANIMEPAHE: 'https://api.consumet.org/anime/animepahe'
};

// Create axios instances for each provider
const clients = Object.entries(PROVIDERS).reduce((acc, [name, baseURL]) => {
  acc[name] = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AnimeRadar/1.0'
    }
  });
  return acc;
}, {} as Record<string, typeof axios>);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function tryProvider(
  providerName: string,
  operation: () => Promise<any>
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Attempting ${providerName} (try ${attempt}/${MAX_RETRIES})`);
      const result = await operation();
      logger.info(`${providerName} succeeded`);
      return result;
    } catch (error: any) {
      lastError = error;
      logger.warn(`${providerName} attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * attempt);
      }
    }
  }
  
  throw lastError;
}

async function fetchFromProvider(
  providerName: string,
  animeId: string
): Promise<Episode[]> {
  const client = clients[providerName];
  const response = await client.get(`/info/${animeId}`);
  
  if (!response.data?.episodes?.length) {
    throw new Error(`No episodes found on ${providerName}`);
  }

  return response.data.episodes.map((ep: any) => ({
    id: String(ep.id),
    number: Number(ep.number),
    title: ep.title || `Episode ${ep.number}`,
    image: ep.image || undefined,
  }));
}

export async function getEpisodes(animeId: string) {
  logger.info(`Fetching episodes for anime: ${animeId}`);
  
  // Try each provider in sequence until one succeeds
  for (const [providerName] of Object.entries(PROVIDERS)) {
    try {
      const episodes = await tryProvider(providerName, () => 
        fetchFromProvider(providerName, animeId)
      );
      
      return {
        episodes,
        hasNextPage: false,
        total: episodes.length,
        provider: providerName.toLowerCase()
      };
    } catch (error) {
      logger.error(`${providerName} failed completely:`, error);
      // Continue to next provider
      continue;
    }
  }

  // If all providers fail, return a user-friendly response
  logger.error('All providers failed to fetch episodes');
  return {
    episodes: [],
    hasNextPage: false,
    total: 0,
    error: {
      message: 'Episodes temporarily unavailable',
      code: 'PROVIDERS_UNAVAILABLE',
      status: 503
    }
  };
}

async function fetchStreamingFromProvider(
  providerName: string,
  episodeId: string
): Promise<StreamingData> {
  const client = clients[providerName];
  const response = await client.get(`/watch/${episodeId}`);
  
  if (!response.data?.sources?.length) {
    throw new Error(`No streaming sources found on ${providerName}`);
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
  };
}

export async function getStreamingSources(episodeId: string): Promise<StreamingData> {
  logger.info(`Fetching streaming sources for episode: ${episodeId}`);
  
  // Try each provider in sequence until one succeeds
  for (const [providerName] of Object.entries(PROVIDERS)) {
    try {
      const streamingData = await tryProvider(providerName, () =>
        fetchStreamingFromProvider(providerName, episodeId)
      );
      
      return {
        ...streamingData,
        provider: providerName.toLowerCase()
      };
    } catch (error) {
      logger.error(`${providerName} streaming failed:`, error);
      // Continue to next provider
      continue;
    }
  }

  // If all providers fail, throw a user-friendly error
  throw {
    message: 'Streaming sources temporarily unavailable',
    code: 'PROVIDERS_UNAVAILABLE',
    status: 503
  };
}