import { useState } from 'react';
import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { Pagination } from '@/components/ui/Pagination';
import { getLatestAnime, mapAnimeResponse } from '@/lib/api';

const ITEMS_PER_PAGE = 30;

export function LatestAnimePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['latest-anime', page],
    async () => {
      const response = await getLatestAnime(page);
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
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Latest Releases
        </h1>
        <p className="text-muted-foreground">
          Discover the newest and currently airing anime series
        </p>
      </div>

      {data?.media && (
        <>
          <AnimeGrid animes={data.media} />
          <Pagination
            currentPage={page}
            totalPages={data.pageInfo.lastPage}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
