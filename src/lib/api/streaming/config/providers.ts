export const PROVIDER_URLS = {
  GOGOANIME: 'https://anikatsu.to',
  CONSUMET: 'https://api.consumet.org/anime/gogoanime',
  BACKUP: 'https://api.animeapi.com'
} as const;

export const PROVIDER_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'AnimeRadar/1.0',
  }
};