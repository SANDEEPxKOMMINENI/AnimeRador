import { Link } from 'react-router-dom';

const GENRE_RELATIONS: Record<string, string[]> = {
  Action: ['Adventure', 'Fantasy', 'Sci-Fi', 'Thriller'],
  Adventure: ['Action', 'Fantasy', 'Sci-Fi'],
  Comedy: ['Slice of Life', 'Romance', 'Drama'],
  Drama: ['Romance', 'Slice of Life', 'Supernatural'],
  Fantasy: ['Adventure', 'Action', 'Romance'],
  Horror: ['Thriller', 'Mystery', 'Supernatural'],
  Mecha: ['Sci-Fi', 'Action', 'Drama'],
  Mystery: ['Thriller', 'Horror', 'Supernatural'],
  Romance: ['Drama', 'Comedy', 'Slice of Life'],
  'Sci-Fi': ['Mecha', 'Action', 'Thriller'],
  'Slice of Life': ['Comedy', 'Drama', 'Romance'],
  Sports: ['Drama', 'Comedy', 'Slice of Life'],
  Supernatural: ['Mystery', 'Horror', 'Fantasy'],
  Thriller: ['Mystery', 'Horror', 'Action'],
};

interface RelatedGenresProps {
  currentGenre: string;
}

export function RelatedGenres({ currentGenre }: RelatedGenresProps) {
  const relatedGenres = GENRE_RELATIONS[currentGenre] || [];

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 font-semibold">Related Genres</h3>
      <div className="flex flex-wrap gap-2">
        {relatedGenres.map((genre) => (
          <Link
            key={genre}
            to={`/genre/${genre}`}
            className="rounded-full bg-accent px-3 py-1 text-sm transition-colors hover:bg-accent/80"
          >
            {genre}
          </Link>
        ))}
      </div>
    </div>
  );
}