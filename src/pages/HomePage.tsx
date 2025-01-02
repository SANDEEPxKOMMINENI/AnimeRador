import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader,
  TrendingUp,
  Star,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Play,
  Heart,
  Clock,
} from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { GenreList } from '@/components/anime/GenreList';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getTrendingAnime,
  getSeasonalAnime,
  getPopularAnime,
  mapAnimeResponse,
} from '@/lib/api';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Filter to exclude adult content
const isFamily = (anime: any) => {
  const adultTerms = ['Ecchi', 'Hentai', 'Adult'];
  return (
    !anime.genres.some((genre: string) => adultTerms.includes(genre)) &&
    !anime.tags?.some(
      (tag: any) => tag.name.includes('Adult') || tag.name.includes('Ecchi')
    )
  );
};

const FEATURED_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&w=2000&q=80',
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    'trending-anime-home',
    async () => {
      const response = await getTrendingAnime(1);
      return {
        ...response,
        media: response.media
          .filter(isFamily)
          .slice(0, 15)
          .map(mapAnimeResponse),
      };
    }
  );

  const { data: seasonalData, isLoading: seasonalLoading } = useQuery(
    'seasonal-anime-home',
    async () => {
      const currentSeason = getCurrentSeason();
      const response = await getSeasonalAnime(
        currentSeason,
        new Date().getFullYear()
      );
      return {
        ...response,
        media: response.media
          .filter(isFamily)
          .slice(0, 10)
          .map(mapAnimeResponse),
      };
    }
  );

  const { data: popularData, isLoading: popularLoading } = useQuery(
    'popular-anime-home',
    async () => {
      const response = await getPopularAnime(1);
      return {
        ...response,
        media: response.media
          .filter(isFamily)
          .slice(0, 5)
          .map(mapAnimeResponse),
      };
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % FEATURED_BACKGROUNDS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (trendingLoading || seasonalLoading || popularLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative -mx-8 -mt-8 min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${FEATURED_BACKGROUNDS[currentBgIndex]})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mx-auto max-w-7xl px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <h1 className="text-5xl font-bold leading-tight tracking-tighter">
              Discover Your Next
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Favorite Anime
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore thousands of anime series and movies, track your progress,
              and connect with other fans.
            </p>

            <div className="flex gap-4">
              {showSearchBar ? (
                <form
                  onSubmit={handleSearch}
                  className="flex w-full max-w-lg gap-2"
                >
                  <Input
                    type="search"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
                  <Button type="submit" size="lg">
                    Search
                  </Button>
                </form>
              ) : (
                <>
                  <Button size="lg" onClick={() => setShowSearchBar(true)}>
                    <Search className="mr-2 h-5 w-5" />
                    Search Anime
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/genres">
                      <Filter className="mr-2 h-5 w-5" />
                      Browse by Genre
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      {popularData?.media && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Featured Anime</h2>
            <Button variant="ghost" asChild>
              <Link to="/popular" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {popularData.media.slice(0, 2).map((anime) => (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="group relative overflow-hidden rounded-xl"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={anime.banner || anime.poster}
                    alt={anime.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white">
                    {anime.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-white/90">
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{anime.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <Play className="mr-1 h-4 w-4" />
                      <span>{anime.episodes || 'TBA'} Episodes</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{anime.duration} min</span>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">
                    {anime.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trendingData?.media && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-red-500" />
              <h2 className="text-3xl font-bold">Trending Now</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/trending" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnimeGrid animes={trendingData.media.slice(0, 10)} />
          </motion.div>
        </section>
      )}

      {/* This Season Section */}
      {seasonalData?.media && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-500" />
              <h2 className="text-3xl font-bold">This Season</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/seasonal" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnimeGrid animes={seasonalData.media} />
          </motion.div>
        </section>
      )}

      {/* Genres Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">Browse by Genre</h2>
            <p className="text-muted-foreground">
              Find your next favorite anime by genre
            </p>
          </div>
        </div>
        <GenreList />
      </section>

      {/* Newsletter Section */}
      <section className="rounded-2xl bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 p-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold">Stay Updated</h2>
          <p className="text-muted-foreground">
            Subscribe to our newsletter for weekly anime recommendations and
            updates.
          </p>
          <form className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12"
            />
            <Button size="lg">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function getCurrentSeason(): 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
}
