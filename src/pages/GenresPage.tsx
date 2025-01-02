import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { GenreList } from '@/components/anime/GenreList';
import { Pagination } from '@/components/ui/Pagination';
import { getAnimeByGenre, mapAnimeResponse } from '@/lib/api';

const ITEMS_PER_PAGE = 30;

export function GenresPage() {
  const { genre } = useParams<{ genre: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['genre-anime', genre, page],
    async () => {
      if (!genre) return null;
      const response = await getAnimeByGenre(genre, page);
      return {
        ...response,
        media: response.media.map(mapAnimeResponse),
      };
    },
    {
      enabled: !!genre,
      keepPreviousData: true,
    }
  );

  if (!genre) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Anime Genres
          </h1>
          <p className="text-muted-foreground">
            Explore anime by your favorite genres
          </p>
        </div>
        <GenreList />
      </div>
    );
  }

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
          {genre} Anime
        </h1>
        <p className="text-muted-foreground">
          Discover the best {genre.toLowerCase()} anime series
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
