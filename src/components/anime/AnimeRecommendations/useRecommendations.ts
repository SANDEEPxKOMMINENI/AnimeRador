import { useQuery } from 'react-query';
import { getRecommendations, mapAnimeResponse } from '@/lib/api';
import { getEnhancedRecommendations } from '@/lib/ml/recommendations';
import type { Anime } from '@/types';

export function useRecommendations(currentAnime: Anime) {
  // Get relevant tags from the current anime
  const relevantTags = currentAnime.tags
    ?.filter((tag) => tag.rank >= 75)
    .slice(0, 5)
    .map((tag) => tag.name);

  return useQuery(
    ['recommendations', currentAnime.id, currentAnime.genres[0], relevantTags],
    async () => {
      // Get initial recommendations based on genre and tags
      const response = await getRecommendations(
        currentAnime.genres[0],
        relevantTags || []
      );
      
      const mappedAnime = response.media
        .filter((anime) => anime.id.toString() !== currentAnime.id)
        .map(mapAnimeResponse);

      // Enhance recommendations using ML
      const enhancedRecommendations = await getEnhancedRecommendations(
        currentAnime,
        mappedAnime,
        10
      );

      return {
        ...response,
        media: enhancedRecommendations,
      };
    },
    {
      enabled: currentAnime.genres.length > 0,
    }
  );
}