import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { AnimeCard } from './AnimeCard';
import { getRecommendations, mapAnimeResponse } from '@/lib/api';
import { getEnhancedRecommendations } from '@/lib/ml/recommendations';
import type { Anime } from '@/types';

interface AnimeRecommendationsProps {
  currentAnime: Anime;
}

export default function AnimeRecommendations({ currentAnime }: AnimeRecommendationsProps) {
  // Get relevant tags from the current anime
  const relevantTags = currentAnime.tags
    ?.filter((tag) => tag.rank >= 75)
    .slice(0, 5)
    .map((tag) => tag.name);

  const { data, isLoading } = useQuery(
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.media.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended Anime</h2>
      <p className="text-sm text-muted-foreground">
        Based on {currentAnime.genres[0]} and similar themes
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.media.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
}