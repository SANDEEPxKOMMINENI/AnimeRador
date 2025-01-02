import axios, { AxiosInstance } from 'axios';
import { logger } from '@/lib/logger';
import type { Episode, StreamingData } from '@/types';

export abstract class BaseProvider {
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

  protected async request<T>(path: string, options = {}): Promise<T> {
    try {
      logger.debug(`${this.name}: Making request to ${path}`);
      const response = await this.client.get(path, options);
      return response.data;
    } catch (error: any) {
      logger.error(`${this.name}: Request failed`, {
        path,
        error: error.message,
        status: error.response?.status
      });
      throw error;
    }
  }

  abstract getEpisodes(animeId: string): Promise<Episode[]>;
  abstract getStreamingSources(episodeId: string): Promise<StreamingData>;
}