import { StreamingService } from '../streaming.service';
import { GogoAnimeProvider } from '../providers/gogoanime';

describe('Streaming Service', () => {
  const streamingService = new StreamingService();

  describe('getEpisodes', () => {
    it('should fetch episodes from primary provider', async () => {
      const result = await streamingService.getEpisodes('21');
      expect(result.episodes).toBeDefined();
      expect(Array.isArray(result.episodes)).toBe(true);
    });

    it('should handle provider errors gracefully', async () => {
      const result = await streamingService.getEpisodes('invalid-id');
      expect(result.episodes).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });

  describe('getStreamingSources', () => {
    it('should fetch streaming sources for valid episode', async () => {
      const result = await streamingService.getStreamingSources('episode-1');
      expect(result.sources).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
    });
  });
});