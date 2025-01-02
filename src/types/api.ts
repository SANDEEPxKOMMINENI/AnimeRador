export interface APIError {
  message: string;
  status?: number;
  errors?: string[];
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface APIResponse<T> {
  data: T;
  pageInfo?: PageInfo;
}

export interface AnimeResponse {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  description: string | null;
  seasonYear: number;
  genres: string[];
  tags: Array<{
    name: string;
    rank: number;
  }>;
  averageScore: number;
  popularity: number;
  episodes: number | null;
  duration: number | null;
  status: string;
  source: string;
  trailer: {
    id: string;
    site: string;
  } | null;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string | null;
  nextAiringEpisode: {
    episode: number;
    airingAt: number;
  } | null;
  studios: {
    nodes: Array<{
      name: string;
    }>;
  };
  externalLinks: Array<{
    url: string;
    site: string;
  }>;
  reviews: {
    nodes: Array<{
      id: number;
      summary: string;
      score: number;
      user: {
        name: string;
        avatar: {
          medium: string;
        };
      };
      createdAt: number;
    }>;
  };
}