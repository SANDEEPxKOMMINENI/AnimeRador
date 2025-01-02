import { type Anime } from '@/types';
import { AnimeCard } from './AnimeCard';

interface AnimeGridProps {
  animes: Anime[];
}

export function AnimeGrid({ animes }: AnimeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}