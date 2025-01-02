import { useState } from 'react';
import { useQuery } from 'react-query';
import { Loader, Trophy, Star, TrendingUp } from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { getPopularAnime, mapAnimeResponse } from '@/lib/api';

export function PopularAnimePage() {
  const [page, setPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState<
    'POPULARITY_DESC' | 'SCORE_DESC'
  >('POPULARITY_DESC');

  const { data, isLoading } = useQuery(
    ['popular-anime', page, sortCriteria],
    async () => {
      const response = await getPopularAnime(page, sortCriteria);
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
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
            Most Popular Anime
          </h1>
        </div>
        <p className="text-muted-foreground">
          The most beloved and widely watched anime series of all time
        </p>
        <div className="flex gap-2">
          <Button
            variant={sortCriteria === 'POPULARITY_DESC' ? 'default' : 'outline'}
            onClick={() => setSortCriteria('POPULARITY_DESC')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Most Popular
          </Button>
          <Button
            variant={sortCriteria === 'SCORE_DESC' ? 'default' : 'outline'}
            onClick={() => setSortCriteria('SCORE_DESC')}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Highest Rated
          </Button>
        </div>
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
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No anime found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
    </div>
  );
}
