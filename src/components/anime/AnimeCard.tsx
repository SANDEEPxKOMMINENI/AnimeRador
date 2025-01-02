import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { type Anime } from '@/types';

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link to={`/anime/${anime.id}`} className="group relative overflow-hidden rounded-lg">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={anime.poster}
          alt={anime.title}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 p-4 text-white">
        <h3 className="font-semibold">{anime.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{anime.rating.toFixed(1)}</span>
          <span className="text-gray-300">•</span>
          <span>{anime.releaseYear}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {anime.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}