import { useQuery } from 'react-query';
import { fetchEpisodes } from '@/lib/api/streaming/client';
import { StreamingError } from '@/lib/api/streaming/errors';
import { useToast } from '@/components/ui/Toast';

export function useAnimeEpisodes(animeId: string, page: number = 1) {
  const { toast } = useToast();

  return useQuery(
    ['animeEpisodes', animeId, page],
    () => fetchEpisodes(animeId, page),
    {
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error instanceof StreamingError && error.code === 'NOT_FOUND') {
          return false;
        }
        // Retry other errors up to 2 times with increasing delay
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        if (error instanceof StreamingError && error.code !== 'NOT_FOUND') {
          toast({
            title: 'Streaming Error',
            description: 'Unable to load episodes. Trying backup sources...',
            variant: 'warning',
          });
        }
      },
      // Return empty episodes array when no data is found
      select: (data) => ({
        episodes: data?.episodes || [],
        hasNextPage: data?.hasNextPage || false,
        total: data?.total || 0,
        provider: data?.provider,
      }),
    }
  );
}