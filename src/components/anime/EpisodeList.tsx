import { useState } from 'react';
import { useQuery } from 'react-query';
import { Play, Loader, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAnimeEpisodes } from '@/hooks/useAnimeEpisodes';
import { useToast } from '@/components/ui/Toast';

interface EpisodeListProps {
  animeId: string;
}

export function EpisodeList({ animeId }: EpisodeListProps) {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const { data, isLoading, error, refetch, isError } = useAnimeEpisodes(animeId, page);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    try {
      setRetryCount(prev => prev + 1);
      toast({
        title: 'Retrying...',
        description: 'Attempting to fetch episodes again',
      });
      await refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Episodes are temporarily unavailable. Please try again later.',
        variant: 'warning',
      });
    }
  };

  // Show loading state for initial load only
  if (isLoading && retryCount === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (isError || !data?.episodes?.length) {
    return (
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-600/70" />
        <h3 className="mt-4 text-lg font-semibold text-yellow-600">
          {error?.code === 'PROVIDERS_UNAVAILABLE' 
            ? 'Episodes Temporarily Unavailable'
            : 'Unable to Load Episodes'}
        </h3>
        <p className="mt-2 text-sm text-yellow-600/90">
          {error?.code === 'PROVIDERS_UNAVAILABLE'
            ? 'Our streaming providers are currently experiencing issues. Please try again in a few moments.'
            : 'We encountered an error while loading the episodes. Please try again.'}
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleRetry}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.provider && (
        <p className="text-sm text-muted-foreground">
          Provided by: {data.provider}
        </p>
      )}
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.episodes.map((episode) => (
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

      {data.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Episodes'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}