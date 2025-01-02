import axios from 'axios';
import { PROVIDER_CONFIG } from './config';
import { withRetry } from '../utils/retry';
import { validateStreamingSources } from '../utils/validation';
import { logger } from '@/lib/logger';
import type { StreamingSource } from '../types';

export async function fetchSourcesFromProvider(
  provider: string,
  baseUrl: string,
  episodeId: string
): Promise<StreamingSource[]> {
  const response = await axios.get(`${baseUrl}/episode/${episodeId}`, {
    timeout: PROVIDER_CONFIG.TIMEOUT,
    headers: {
      'User-Agent': 'AnimeRadar/1.0'
    }
  });

  if (!response.data?.sources?.length) {
    throw new Error('No streaming sources found');
  }

  const sources = response.data.sources.map((source: any) => ({
    url: source.url || source.file,
    quality: source.quality || source.label || '720p',
    isM3U8: source.type === 'hls' || source.url?.includes('.m3u8')
  }));

  const validSources = await validateStreamingSources(sources);
  if (!validSources.length) {
    throw new Error('No valid streaming sources found');
  }

  return validSources;
}

export async function getFallbackSources(episodeId: string): Promise<StreamingSource[]> {
  for (const [provider, baseUrl] of Object.entries(PROVIDER_CONFIG.PROVIDERS)) {
    try {
      return await withRetry(
        () => fetchSourcesFromProvider(provider, baseUrl, episodeId),
        {
          maxRetries: PROVIDER_CONFIG.MAX_RETRIES,
          retryDelay: PROVIDER_CONFIG.RETRY_DELAY,
          operationName: `Fetching sources from ${provider}`
        }
      );
    } catch (error) {
      logger.warn(`Provider ${provider} failed to fetch sources:`, error);
      continue;
    }
  }

  logger.warn('All providers failed, using fallback CDN');
  return [{
    url: `${PROVIDER_CONFIG.FALLBACK_CDN}/fallback/${episodeId}/720.m3u8`,
    quality: '720p',
    isM3U8: true
  }];
}