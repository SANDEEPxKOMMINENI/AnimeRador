import axios from 'axios';
import { logger } from '@/lib/logger';
import type { StreamingSource } from '@/types';

export async function validateStreamingUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: { Range: 'bytes=0-0' }
    });
    return response.status === 200 || response.status === 206;
  } catch (error) {
    logger.debug('Stream validation failed:', { url, error });
    return false;
  }
}

export async function validateStreamingSources(
  sources: StreamingSource[]
): Promise<StreamingSource[]> {
  const validatedSources = await Promise.all(
    sources.map(async (source) => {
      const isValid = await validateStreamingUrl(source.url);
      return isValid ? source : null;
    })
  );

  return validatedSources.filter(Boolean) as StreamingSource[];
}