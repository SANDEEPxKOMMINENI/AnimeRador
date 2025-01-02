import axios, { AxiosError } from 'axios';
import { APIError } from './errors';

export const ANILIST_API = 'https://graphql.anilist.co';
export const MAL_API = 'https://api.myanimelist.net/v2';
export const REDDIT_API = 'https://www.reddit.com/r/anime/search.json';

export const client = axios.create({
  baseURL: ANILIST_API,
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      throw new APIError(
        error.message,
        error.response.status,
        error.response.data?.errors?.map((e: any) => e.message)
      );
    }
    if (error.request) {
      throw new APIError('No response received from server');
    }
    throw new APIError(error.message);
  }
);