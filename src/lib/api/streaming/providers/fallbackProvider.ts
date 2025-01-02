import axios from 'axios';
import { logger } from '@/lib/logger';
import type { StreamingSource, Episode } from '../types';

// Multiple provider endpoints for redundancy
const PROVIDERS = {
  PRIMARY: 'https://api.gogoanime.tv',
  BACKUP1: 'https://api.animefox.tv',
  BACKUP2: 'https://api.zoro.to',
  BACKUP3: 'https://api.9anime.to'
};

const FALLBACK_CDN = 'https://cdn.animerad.ar';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getFallbackSources(episodeId: string): Promise<StreamingSource[]> {
  for (const [provider, baseUrl] of Object.entries(PROVIDERS)) {
    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
      try {
        logger.info(`Attempting to fetch sources from ${provider} (Attempt ${retryCount + 1})`);
        
        const response = await axios.get(`${baseUrl}/episode/${episodeId}`, {
          timeout: 5000,
          headers: {
            'User-Agent': 'AnimeRadar/1.0'
          }
        });

        if (response.data?.sources?.length) {
          const sources = response.data.sources.map((source: any) => ({
            url: source.url || source.file,
            quality: source.quality || source.label || '720p',
            isM3U8: source.type === 'hls' || source.url?.includes('.m3u8')
          }));

          // Validate streaming URLs
          const validSources = await Promise.all(
            sources.map(async (source) => {
              try {
                await axios.head(source.url);
                return source;
              } catch {
                return null;
              }
            })
          );

          const filteredSources = validSources.filter(Boolean);
          if (filteredSources.length > 0) {
            logger.info(`Successfully fetched valid sources from ${provider}`);
            return filteredSources;
          }
        }

        retryCount++;
        if (retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY * retryCount);
        }
      } catch (error) {
        logger.warn(`Failed to fetch from ${provider}:`, error);
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY * retryCount);
        }
      }
    }
  }
  
  // Return default sources if all providers fail
  logger.warn('All providers failed, using fallback CDN');
  return [
    {
      url: `${FALLBACK_CDN}/fallback/${episodeId}/720.m3u8`,
      quality: '720p',
      isM3U8: true
    }
  ];
}

export async function getFallbackEpisodes(animeId: string): Promise<Episode[]> {
  for (const [provider, baseUrl] of Object.entries(PROVIDERS)) {
    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
      try {
        logger.info(`Attempting to fetch episodes from ${provider} (Attempt ${retryCount + 1})`);
        
        const response = await axios.get(`${baseUrl}/anime/${animeId}/episodes`, {
          timeout: 5000,
          headers: {
            'User-Agent': 'AnimeRadar/1.0'
          }
        });

        if (response.data?.episodes?.length) {
          logger.info(`Successfully fetched episodes from ${provider}`);
          return response.data.episodes.map((ep: any) => ({
            id: String(ep.id || ep.episodeId || `${animeId}-${ep.number}`),
            number: Number(ep.number || ep.episodeNumber),
            title: ep.title || `Episode ${ep.number}`,
            image: ep.image || ep.thumbnail || `${FALLBACK_CDN}/thumbnails/${animeId}/${ep.number}.jpg`
          }));
        }

        retryCount++;
        if (retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY * retryCount);
        }
      } catch (error) {
        logger.warn(`Failed to fetch episodes from ${provider}:`, error);
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY * retryCount);
        }
      }
    }
  }

  // Return placeholder episodes if all providers fail
  logger.warn('All providers failed, using fallback episodes');
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${animeId}-${i + 1}`,
    number: i + 1,
    title: `Episode ${i + 1}`,
    image: `${FALLBACK_CDN}/thumbnails/${animeId}/${i + 1}.jpg`
  }));
}