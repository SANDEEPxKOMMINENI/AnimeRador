import axios, { AxiosInstance } from 'axios';
import { logger } from '@/lib/logger';
import type { StreamingData } from '../types';
import { validateStreamingSources } from '../utils/validation';

export abstract class BaseStreamingProvider {
  protected client: AxiosInstance;
  
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AnimeRadar/1.0'
      }
    });
  }

  abstract get name(): string;

  protected async fetchAndValidateSources(episodeId: string): Promise<StreamingData | null> {
    try {
      const response = await this.client.get(`/watch/${episodeId}`);
      
      if (!response.data?.sources?.length) {
        return null;
      }

      const validSources = await validateStreamingSources(
        response.data.sources.map((source: any) => ({
          url: source.url,
          quality: source.quality || '720p',
          isM3U8: source.url.includes('.m3u8')
        }))
      );

      if (!validSources.length) {
        return null;
      }

      return {
        sources: validSources,
        subtitles: response.data.subtitles || [],
        headers: response.data.headers,
        provider: this.name
      };
    } catch (error) {
      logger.warn(`${this.name} provider failed:`, error);
      return null;
    }
  }
}