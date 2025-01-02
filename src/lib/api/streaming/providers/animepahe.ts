import axios from 'axios';
import { StreamingProvider } from '../types';
import { logger } from '@/lib/logger';

export class AnimePaheProvider implements StreamingProvider {
  name = 'animepahe';
  private baseUrl = 'https://api.animepahe.com/api';

  async getStreamingSources(episodeId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/episode/${episodeId}`);
      return response.data.sources.map((source: any) => ({
        url: source.url,
        quality: source.quality,
        isM3U8: false
      }));
    } catch (error) {
      logger.error('AnimePahe streaming error:', error);
      throw error;
    }
  }

  async getEpisodesList(animeId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/anime/${animeId}/episodes`);
      return response.data.episodes.map((episode: any) => ({
        id: episode.id,
        number: episode.episode,
        title: `Episode ${episode.episode}`,
        image: episode.snapshot
      }));
    } catch (error) {
      logger.error('AnimePahe episodes error:', error);
      throw error;
    }
  }
}