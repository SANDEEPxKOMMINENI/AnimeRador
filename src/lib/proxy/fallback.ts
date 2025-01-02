import { type Episode } from '@/types';

export const fallbackEpisodes: Episode[] = [
  {
    id: 'fallback-1',
    number: 1,
    title: 'Episode 1',
    description: 'Content temporarily unavailable'
  }
];

export function getFallbackData(animeId: string) {
  return {
    episodes: fallbackEpisodes,
    hasNextPage: false,
    total: fallbackEpisodes.length
  };
}