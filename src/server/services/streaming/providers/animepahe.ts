import axios from 'axios';
import { logger } from '@/lib/logger';
import { StreamingProvider } from '../types';
import { delay } from '../utils';

export class AnimePaheProvider implements StreamingProvider {
  private client = axios.create({
    baseURL: 'https://animepahe.ru/api',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://animepahe.ru/'
    }
  });

  async getEpisodes(animeId: string) {
    try {
      const response = await this.client.get('', {
        params: {
          m: 'release',
          id: animeId
        }
      });

      if (!response.data?.data?.length) {
        throw new Error('No episodes found');
      }

      return response.data.data.map((ep: any) => ({
        id: String(ep.session),
        number: Number(ep.episode),
        title: `Episode ${ep.episode}`,
        image: ep.snapshot,
      }));
    } catch (error) {
      logger.error('AnimePahe episodes fetch failed:', error);
      throw error;
    }
  }

  async getStreamingSources(episodeId: string) {
    try {
      const response = await this.client.get('', {
        params: {
          m: 'links',
          id: episodeId
        }
      });

      if (!response.data?.data) {
        throw new Error('No streaming sources found');
      }

      const sources = Object.values(response.data.data).map((quality: any) => ({
        url: quality.kwik,
        quality: `${quality.resolution}p`,
        isM3U8: false
      }));

      return {
        sources,
        subtitles: [],
        headers: {
          'Referer': 'https://animepahe.ru/'
        }
      };
    } catch (error) {
      logger.error('AnimePahe streaming sources fetch failed:', error);
      throw error;
    }
  }
}