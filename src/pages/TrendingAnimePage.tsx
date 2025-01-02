import { useState } from 'react';
import { useQuery } from 'react-query';
import { Loader, TrendingUp } from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { Pagination } from '@/components/ui/Pagination';
import { getTrendingAnime, mapAnimeResponse } from '@/lib/api';

export function TrendingAnimePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['trending-anime', page],
    async () => {
      const response = await getTrendingAnime(page);
      return {
        ...response,
        media: response.media.map(mapAnimeResponse),
      };
    },
    {
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Trending Now
          </h1>
        </div>
        <p className="text-muted-foreground">
          Currently hot and trending anime series that everyone's watching
        </p>
      </div>

      {data?.media && data.media.length > 0 ? (
        <>
          <AnimeGrid animes={data.media} />
          <Pagination
            currentPage={page}
            totalPages={Math.min(data.pageInfo.lastPage, 50)}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            No trending anime found
          </h3>
          <p className="text-muted-foreground">
            Check back later for new trending series
          </p>
        </div>
      )}
    </div>
  );
}
