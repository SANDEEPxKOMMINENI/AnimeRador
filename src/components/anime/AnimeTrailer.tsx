```typescript
import { useQuery } from 'react-query';
import { getEnhancedTrailer } from '@/lib/api/trailers';
import { Loader } from 'lucide-react';

interface AnimeTrailerProps {
  videoId: string;
  title: string;
}

export function AnimeTrailer({ videoId, title }: AnimeTrailerProps) {
  const { data: trailerInfo, isLoading } = useQuery(
    ['trailer', videoId],
    () => getEnhancedTrailer(videoId),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex aspect-video items-center justify-center bg-black">
        <Loader className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!trailerInfo) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Trailer</h2>
      <div className="aspect-video overflow-hidden rounded-lg">
        <iframe
          width="100%"
          height="100%"
          src={`${trailerInfo.embedUrl}?autoplay=0&rel=0&modestbranding=1`}
          title={`${title} Trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="border-0"
        />
      </div>
    </div>
  );
}
```