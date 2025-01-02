import { Episode } from '@/types';
import { STREAMING_CONFIG } from '../config';

export function generateFallbackEpisodes(animeId: string): Episode[] {
  const { count, thumbnailTemplate } = STREAMING_CONFIG.FALLBACK_EPISODES;
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${animeId}-${i + 1}`,
    number: i + 1,
    title: `Episode ${i + 1}`,
    image: thumbnailTemplate.replace('{number}', String(i + 1))
  }));
}