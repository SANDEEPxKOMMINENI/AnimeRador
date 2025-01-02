import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { AnimeGrid } from '../AnimeGrid';
import { useRecommendations } from './useRecommendations';
import type { Anime } from '@/types';

interface AnimeRecommendationsProps {
  currentAnime: Anime;
}

export default function AnimeRecommendations({ currentAnime }: AnimeRecommendationsProps) {
  const { data, isLoading } = useRecommendations(currentAnime);

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
      <AnimeGrid animes={data.media} />
    </section>
  );
}