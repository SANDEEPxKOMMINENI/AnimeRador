```typescript
import axios, { AxiosInstance } from 'axios';
import { STREAMING_CONFIG } from '../config';
import { StreamingError } from '../errors';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '../types';

export class ProviderAdapter {
  private client: AxiosInstance;
  private provider: string;

  constructor(provider: string) {
    const config = STREAMING_CONFIG.providers[provider as keyof typeof STREAMING_CONFIG.providers];
    
    this.provider = provider;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'User-Agent': 'AnimeRadar/1.0',
        'Accept': 'application/json',
      },
      maxRedirects: STREAMING_CONFIG.maxRedirects,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  private handleError(error: any) {
    logger.error(`${this.provider} provider error:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });

    if (error.response?.status === 404) {
      throw new StreamingError('Content not found', 'NOT_FOUND', 404);
    }

    throw new StreamingError(
      `Failed to fetch data from ${this.provider}`,
      'SERVICE_ERROR',
      503
    );
  }

  async getEpisodes(animeId: string): Promise<Episode[]> {
    try {
      const response = await this.client.get(`/anime/${animeId}/episodes`);
      return this.normalizeEpisodes(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStreamingData(episodeId: string): Promise<StreamingData> {
    try {
      const response = await this.client.get(`/episode/${episodeId}/sources`);
      return this.normalizeStreamingData(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private normalizeEpisodes(data: any): Episode[] {
    // Normalize episode data based on provider format
    const episodes = Array.isArray(data.episodes) ? data.episodes : [];
    return episodes.map((ep: any) => ({
      id: String(ep.id || ep.episode_id),
      number: Number(ep.number || ep.episode_number),
      title: ep.title || ep.name || undefined,
      image: ep.image || ep.thumbnail || ep.snapshot || undefined,
    }));
  }

  private normalizeStreamingData(data: any): StreamingData {
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const subtitles = Array.isArray(data.subtitles) ? data.subtitles : [];

    return {
      sources: sources.map((source: any) => ({
        url: source.url || source.file,
        quality: source.quality || source.label,
        isM3U8: source.type === 'hls' || source.url?.includes('.m3u8'),
      })),
      subtitles: subtitles.map((sub: any) => ({
        url: sub.url || sub.file,
        lang: sub.lang || sub.label,
      })),
    };
  }
}
```