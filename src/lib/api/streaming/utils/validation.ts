import { logger } from '@/lib/logger';
import type { StreamingSource } from '../types';

export async function validateStreamingUrl(url: string): Promise<boolean> {
  try {
    // For M3U8 streams, just check if the URL is accessible
    if (url.includes('.m3u8')) {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    }

    // For direct video URLs, check if they support range requests
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'Range': 'bytes=0-0' }
    });

    return response.ok && (response.status === 200 || response.status === 206);
  } catch (error) {
    logger.debug('Stream validation failed:', { url, error });
    return false;
  }
}

export async function validateStreamingSources(
  sources: StreamingSource[]
): Promise<StreamingSource[]> {
  logger.info('Validating streaming sources...');

  const validationPromises = sources.map(async (source) => {
    try {
      const isValid = await validateStreamingUrl(source.url);
      if (isValid) {
        logger.debug('Valid source found:', { quality: source.quality });
        return source;
      }
      logger.debug('Invalid source:', { quality: source.quality });
      return null;
    } catch (error) {
      logger.error('Source validation error:', { source, error });
      return null;
    }
  });

  const validatedSources = await Promise.all(validationPromises);
  const filteredSources = validatedSources.filter(Boolean) as StreamingSource[];

  logger.info(`Found ${filteredSources.length} valid sources out of ${sources.length}`);
  return filteredSources;
}