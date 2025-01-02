export interface Anime {
  id: string;
  title: string;
  nativeTitle: string;
  description: string;
  releaseYear: number;
  genres: string[];
  tags: Array<{
    name: string;
    rank: number;
  }>;
  rating: number;
  popularity: number;
  episodes: number;
  duration: number;
  status: string;
  source: string;
  trailer: {
    id: string;
    site: string;
  } | null;
  poster: string;
  banner: string | null;
  nextEpisode: {
    episode: number;
    airingAt: number;
  } | null;
  studios: string[];
  externalLinks: Array<{
    url: string;
    site: string;
  }>;
  reviews: Review[];
}

export interface Review {
  id: string;
  summary: string;
  score: number;
  userName: string;
  userAvatar: string;
  createdAt: number;
}

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  score: number;
  numComments: number;
  created: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  favorites: string[];
  watchlist: WatchlistItem[];
}

export interface WatchlistItem {
  animeId: string;
  status: WatchStatus;
  progress: number;
  rating?: number;
  updatedAt: Date;
}

export type WatchStatus = 'watching' | 'completed' | 'planToWatch' | 'dropped';

export interface AuthResponse {
  token: string;
  user: User;
}


export interface AMV {
  id: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
  platform: string;
  duration?: number;
}