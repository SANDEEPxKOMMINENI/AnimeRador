import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { getAnimeByGenre, mapAnimeResponse } from '@/lib/api';
import { RelatedGenres } from '@/components/anime/RelatedGenres';

export function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const { data, isLoading } = useQuery(['genre', genre], async () => {
    if (!genre) return null;
    const response = await getAnimeByGenre(genre);
    return {
      ...response,
      media: response.media.map(mapAnimeResponse),
    };
  });

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
        <h1 className="text-3xl font-bold">{genre} Anime</h1>
        <p className="text-muted-foreground">
          Discover the best {genre.toLowerCase()} anime series and movies
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {data?.media && <AnimeGrid animes={data.media} />}
        </div>

        <aside className="space-y-8">
          <RelatedGenres currentGenre={genre} />
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 font-semibold">About {genre}</h3>
            <p className="text-sm text-muted-foreground">
              {getGenreDescription(genre)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getGenreDescription(genre: string): string {
  const descriptions: Record<string, string> = {
    Action:
      'Exciting, adrenaline-pumping shows with dynamic fight scenes and intense physical conflicts.',
    Adventure:
      'Stories that follow characters on journeys, exploring new worlds and facing challenges.',
    Comedy:
      'Shows focused on humor and entertainment, ranging from slapstick to clever wordplay.',
    Drama:
      'Character-driven narratives dealing with serious themes and emotional conflicts.',
    Fantasy:
      'Series set in magical worlds with supernatural elements and mythical creatures.',
    Horror: 'Dark, frightening shows designed to evoke fear and suspense.',
    Mecha:
      'Shows featuring giant robots and mechanical suits, often in science fiction settings.',
    Mystery:
      'Stories centered around solving puzzles, crimes, or uncovering secrets.',
    Romance:
      'Tales focusing on love, relationships, and emotional connections between characters.',
    'Sci-Fi':
      'Science fiction series exploring advanced technology and futuristic concepts.',
    'Slice of Life':
      'Shows depicting everyday experiences and normal life situations.',
    Sports:
      'Series centered around athletic competition and sporting achievements.',
    Supernatural:
      'Shows featuring paranormal elements, spirits, and otherworldly phenomena.',
    Thriller:
      'Suspenseful series designed to keep viewers on the edge of their seats.',
  };

  return descriptions[genre] || 'Explore amazing anime in this genre.';
}
