import { useState } from 'react';
import { useQuery } from 'react-query';
import { Loader, Calendar, Star, TrendingUp } from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { getSeasonalAnime, mapAnimeResponse } from '@/lib/api';

const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

function getCurrentSeason(): (typeof SEASONS)[number] {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
}

function getYear(): number {
  return new Date().getFullYear();
}

export function SeasonalAnimePage() {
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
  const [selectedYear, setSelectedYear] = useState(getYear());
  const [sortBy, setSortBy] = useState<'POPULARITY_DESC' | 'SCORE_DESC'>(
    'POPULARITY_DESC'
  );

  const { data, isLoading } = useQuery(
    ['seasonal-anime', selectedSeason, selectedYear, sortBy],
    async () => {
      const response = await getSeasonalAnime(
        selectedSeason,
        selectedYear,
        1,
        sortBy
      );
      return {
        ...response,
        media: response.media.map(mapAnimeResponse),
      };
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
          <Calendar className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Seasonal Anime
          </h1>
        </div>
        <p className="text-muted-foreground">
          Discover new anime releases by season
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            defaultValue={selectedSeason}
            onValueChange={(value) =>
              setSelectedSeason(value as (typeof SEASONS)[number])
            }
          >
            <TabsList>
              {SEASONS.map((season) => (
                <TabsTrigger
                  key={season}
                  value={season}
                  className={
                    selectedSeason === season
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  }
                >
                  {season.charAt(0) + season.slice(1).toLowerCase()}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-md border bg-background px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => getYear() - i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'POPULARITY_DESC' ? 'default' : 'outline'}
            onClick={() => setSortBy('POPULARITY_DESC')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Most Popular
          </Button>
          <Button
            variant={sortBy === 'SCORE_DESC' ? 'default' : 'outline'}
            onClick={() => setSortBy('SCORE_DESC')}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Highest Rated
          </Button>
        </div>

        {data?.media && data.media.length > 0 ? (
          <AnimeGrid animes={data.media} />
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No anime found</h3>
            <p className="text-muted-foreground">
              There are no anime listed for this season yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
