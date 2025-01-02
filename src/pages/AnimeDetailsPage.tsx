import { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Heart,
  Loader,
  Star,
  Tv,
  Clock,
  Link as LinkIcon,
  Play,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDate } from '@/lib/utils';
import AnimeRecommendations from '@/components/anime/AnimeRecommendations';
import { ReviewSection } from '@/components/anime/ReviewSection';
import { ExternalDiscussions } from '@/components/anime/ExternalDiscussions';
import { EpisodeList } from '@/components/anime/EpisodeList';
import { getAnimeById, mapAnimeResponse } from '@/lib/api';


type ActiveTab = 'episodes' | 'reviews' | 'discussions';

export function AnimeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('episodes');

  const { data: anime, isLoading } = useQuery(['anime', id], async () => {
    if (!id) return null;
    const animeData = await getAnimeById(id);
    return animeData ? mapAnimeResponse(animeData as any) : null;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Anime not found</h1>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'episodes':
        return <EpisodeList animeId={id!} />;
      case 'reviews':
        return <ReviewSection reviews={anime.reviews} />;
      case 'discussions':
        return <ExternalDiscussions animeTitle={anime.title} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12">
      {anime.banner && (
        <div className="relative -mt-8 h-[300px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <img
            src={anime.banner}
            alt={anime.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg">
            <img
              src={anime.poster}
              alt={anime.title}
              className="h-full w-full object-cover"
            />
          </div>
          {user && (
            <Button className="w-full" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Add to Favorites
            </Button>
          )}
          <div className="space-y-2 rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Episodes</dt>
                <dd>{anime.episodes || 'TBA'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd>{anime.duration} minutes</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>{anime.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Studios</dt>
                <dd>{anime.studios.join(', ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Source</dt>
                <dd>{anime.source}</dd>
              </div>
            </dl>
          </div>
          {anime.externalLinks.length > 0 && (
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <h3 className="font-semibold">External Links</h3>
              <div className="flex flex-wrap gap-2">
                {anime.externalLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm"
                  >
                    <LinkIcon className="mr-1 h-3 w-3" />
                    {link.site}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{anime.title}</h1>
            {anime.nativeTitle && (
              <p className="text-lg text-muted-foreground">
                {anime.nativeTitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{anime.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{anime.releaseYear}</span>
              </div>
              <div className="flex items-center">
                <Tv className="mr-1 h-4 w-4" />
                <span>{anime.episodes || 'TBA'} Episodes</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{anime.duration} min</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-secondary px-3 py-1 text-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="text-lg leading-relaxed">{anime.description}</p>

          {anime.nextEpisode && (
            <div className="rounded-lg bg-accent p-4">
              <h3 className="font-semibold">Next Episode</h3>
              <p className="text-sm text-muted-foreground">
                Episode {anime.nextEpisode.episode} airs on{' '}
                {formatDate(
                  new Date(anime.nextEpisode.airingAt * 1000).toISOString()
                )}
              </p>
            </div>
          )}

          {anime.trailer && anime.trailer.site === 'youtube' && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Trailer</h2>
              <div className="aspect-video overflow-hidden rounded-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${anime.trailer.id}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex border-b">
              <Button
                variant={activeTab === 'episodes' ? 'default' : 'ghost'}
                className="relative px-4 py-2"
                onClick={() => setActiveTab('episodes')}
              >
                <Play className="mr-2 h-4 w-4" />
                Episodes
                {activeTab === 'episodes' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Button>
              <Button
                variant={activeTab === 'reviews' ? 'default' : 'ghost'}
                className="relative px-4 py-2"
                onClick={() => setActiveTab('reviews')}
              >
                <Star className="mr-2 h-4 w-4" />
                Reviews
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Button>
              <Button
                variant={activeTab === 'discussions' ? 'default' : 'ghost'}
                className="relative px-4 py-2"
                onClick={() => setActiveTab('discussions')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Discussions
                {activeTab === 'discussions' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Button>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>

      <AnimeRecommendations currentAnime={anime} />
    </div>
  );
}
