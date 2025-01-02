import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useAnimeEpisodes } from '@/hooks/useAnimeEpisodes';
import { useStreamingRetry } from '@/hooks/useStreamingRetry';
import { EpisodeGrid } from './EpisodeGrid';
import { LoadMoreButton } from './LoadMoreButton';
import { ErrorState } from './ErrorState';

interface EpisodeListProps {
  animeId: string;
}

export function EpisodeList({ animeId }: EpisodeListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isError } = useAnimeEpisodes(animeId, page);
  const { retry, isRetrying, retryCount } = useStreamingRetry();

  const handleRetry = () => retry(refetch);

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
    return <ErrorState error={error} onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  return (
    <div className="space-y-4">
      {data.provider && (
        <p className="text-sm text-muted-foreground">
          Provided by: {data.provider}
        </p>
      )}
      
      <EpisodeGrid episodes={data.episodes} animeId={animeId} />

      {data.hasNextPage && (
        <LoadMoreButton 
          onClick={() => setPage(p => p + 1)} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
}