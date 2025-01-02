import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Search as SearchIcon,
  Loader,
  Filter,
  X,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { searchAnime, mapAnimeResponse } from '@/lib/api';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';

const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mecha',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const YEARS = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i
);

const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

const STATUS = ['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED'];

const FORMATS = ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC'];

interface AdvancedSearchFilters {
  genres: string[];
  year?: number;
  season?: string;
  status?: string;
  format?: string;
  isAdult: boolean;
  minimumScore?: number;
  sort: string;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    genres: [],
    isAdult: false,
    sort: 'POPULARITY_DESC',
  });

  const { data, isLoading } = useQuery(
    ['search-anime', searchTerm, filters],
    async () => {
      if (!searchTerm && !filters.genres.length) return null;
      const response = await searchAnime(searchTerm, filters);
      return {
        ...response,
        media: response.media.map(mapAnimeResponse),
      };
    },
    {
      enabled: !!(searchTerm || filters.genres.length),
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query.trim());
  };

  const handleGenreToggle = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      isAdult: false,
      sort: 'POPULARITY_DESC',
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative space-y-4 rounded-xl bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 p-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Discover Anime
          </h1>
          <p className="text-muted-foreground">
            Search through thousands of anime series and movies
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Advanced
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advanced Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="genres">
                    <AccordionTrigger>Genres</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {GENRES.map((genre) => (
                          <Button
                            key={genre}
                            variant={
                              filters.genres.includes(genre)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => handleGenreToggle(genre)}
                            className="justify-start"
                          >
                            {genre}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="year-season">
                    <AccordionTrigger>Year & Season</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label>Year</Label>
                          <Select
                            value={filters.year?.toString()}
                            onValueChange={(value) =>
                              setFilters((prev) => ({
                                ...prev,
                                year: parseInt(value),
                              }))
                            }
                          >
                            <option value="">Any Year</option>
                            {YEARS.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Season</Label>
                          <ToggleGroup
                            type="single"
                            value={filters.season}
                            onValueChange={(value) =>
                              setFilters((prev) => ({ ...prev, season: value }))
                            }
                          >
                            {SEASONS.map((season) => (
                              <ToggleGroupItem key={season} value={season}>
                                {season.charAt(0) +
                                  season.slice(1).toLowerCase()}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="status-format">
                    <AccordionTrigger>Status & Format</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select
                            value={filters.status}
                            onValueChange={(value) =>
                              setFilters((prev) => ({ ...prev, status: value }))
                            }
                          >
                            <option value="">Any Status</option>
                            {STATUS.map((status) => (
                              <option key={status} value={status}>
                                {status.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Format</Label>
                          <Select
                            value={filters.format}
                            onValueChange={(value) =>
                              setFilters((prev) => ({ ...prev, format: value }))
                            }
                          >
                            <option value="">Any Format</option>
                            {FORMATS.map((format) => (
                              <option key={format} value={format}>
                                {format}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="other">
                    <AccordionTrigger>Other Options</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="adult-content">Adult Content</Label>
                          <Switch
                            id="adult-content"
                            checked={filters.isAdult}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                isAdult: checked,
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Sort By</Label>
                          <Select
                            value={filters.sort}
                            onValueChange={(value) =>
                              setFilters((prev) => ({ ...prev, sort: value }))
                            }
                          >
                            <option value="POPULARITY_DESC">Popularity</option>
                            <option value="SCORE_DESC">Score</option>
                            <option value="TRENDING_DESC">Trending</option>
                            <option value="START_DATE_DESC">Newest</option>
                          </Select>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button
                  onClick={() =>
                    document.querySelector('form')?.requestSubmit()
                  }
                >
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
            Search
          </Button>
        </form>

        <AnimatePresence>
          {filters.genres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2"
            >
              {filters.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="gap-1">
                  {genre}
                  <button
                    onClick={() => handleGenreToggle(genre)}
                    className="ml-1 rounded-full hover:bg-background/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {data?.media && data.media.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Search Results</h2>
            <p className="text-sm text-muted-foreground">
              Found {data.media.length} results
            </p>
          </div>
          <AnimeGrid animes={data.media} />
        </motion.div>
      ) : searchTerm && !isLoading ? (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : null}
    </div>
  );
}
