export * from './providers/streamingProviders';
export * from './types';

import { getStreamingSources } from './providers/streamingProviders';
import { sanitizeStreamingData } from './utils/serialization';
import { logger } from '@/lib/logger';
import type { StreamingData } from './types';

export async function getEpisodeStreaming(episodeId: string): Promise<StreamingData> {
  try {
    const result = await getStreamingSources(episodeId);
    
    // Sanitize and ensure all data is serializable
    const sanitizedData = sanitizeStreamingData(result);
    
    // Sort sources by quality
    sanitizedData.sources.sort((a, b) => {
      const qualityA = parseInt(a.quality.replace('p', '')) || 0;
      const qualityB = parseInt(b.quality.replace('p', '')) || 0;
      return qualityB - qualityA;
    });

    return sanitizedData;
  } catch (error) {
    logger.error('Streaming error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      episodeId
    });
    
    throw {
      message: 'Failed to fetch streaming data',
      code: 'STREAMING_ERROR',
      status: 503
    };
  }
}