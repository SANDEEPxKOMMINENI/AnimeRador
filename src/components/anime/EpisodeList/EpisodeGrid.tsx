import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Episode } from '@/types';

interface EpisodeGridProps {
  episodes: Episode[];
  animeId: string;
}

export function EpisodeGrid({ episodes, animeId }: EpisodeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {episodes.map((episode) => (
        <Link
          key={episode.id}
          to={`/watch/${animeId}/${episode.id}`}
          className="group relative overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent"
        >
          {episode.image ? (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={episode.image}
                alt={`Episode ${episode.number}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="p-2">
            <p className="font-medium">Episode {episode.number}</p>
            {episode.title && (
              <p className="text-sm text-muted-foreground truncate">
                {episode.title}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}