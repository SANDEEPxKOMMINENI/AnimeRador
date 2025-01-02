import { useQuery } from 'react-query';
import { getEpisodeStreaming } from '@/lib/api/streaming';
import { StreamingError } from '@/lib/api/streaming';

export function useEpisodeStreaming(episodeId: string) {
  return useQuery(
    ['episodeStreaming', episodeId],
    () => getEpisodeStreaming(episodeId),
    {
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error instanceof StreamingError && error.status === 404) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onError: (error) => {
        if (error instanceof StreamingError) {
          console.error(`Streaming error: ${error.message} (${error.code})`);
        }
      },
    }
  );
}