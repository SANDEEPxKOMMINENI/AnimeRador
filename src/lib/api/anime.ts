import { client } from './client';
import { mapAnimeResponse } from './mapper';
import { handleError } from './errors';
import type { AnimeResponse, APIResponse } from '@/types/api';
import {
  getLatestAnimeQuery,
  getAnimeByIdQuery,
  getAnimeByGenreQuery,
  searchAnimeQuery,
  getRecommendationsQuery,
  getSeasonalAnimeQuery,
  getTrendingAnimeQuery,
  getPopularAnimeQuery,
} from './queries';

export async function getLatestAnime(page = 1) {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: getLatestAnimeQuery,
      variables: { page },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getAnimeById(id: string) {
  try {
    const response = await client.post<APIResponse<{ Media: AnimeResponse }>>('', {
      query: getAnimeByIdQuery,
      variables: { id: parseInt(id) },
    });
    return mapAnimeResponse(response.data.data.Media);
  } catch (error) {
    return handleError(error);
  }
}

export async function getAnimeByGenre(genre: string, page = 1) {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: getAnimeByGenreQuery,
      variables: { page, genre },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function searchAnime(query: string) {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: searchAnimeQuery,
      variables: { search: query },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getRecommendations(genre: string, tags: string[]) {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: getRecommendationsQuery,
      variables: { genre, tags },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getSeasonalAnime(season: string, year: number, page = 1, sortBy = 'POPULARITY_DESC') {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: getSeasonalAnimeQuery,
      variables: {
        season,
        year,
        page,
        sort: [sortBy],
      },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getTrendingAnime(page = 1) {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: getTrendingAnimeQuery,
      variables: { page },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getPopularAnime(page = 1, sortBy = 'POPULARITY_DESC') {
  try {
    const response = await client.post<APIResponse<{ Page: { media: AnimeResponse[] } }>>('', {
      query: getPopularAnimeQuery,
      variables: { page, sort: [sortBy] },
    });
    return {
      ...response.data.data.Page,
      media: response.data.data.Page.media.map(mapAnimeResponse),
    };
  } catch (error) {
    return handleError(error);
  }
}