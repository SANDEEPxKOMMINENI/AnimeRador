import { getTrendingAnime, getSeasonalAnime } from './anime';

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const SEASONAL_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: {
  trending?: CacheItem<any>;
  seasonal?: CacheItem<any>;
} = {};

export async function getCachedTrendingAnime() {
  const now = Date.now();
  if (cache.trending && now - cache.trending.timestamp < CACHE_DURATION) {
    return cache.trending.data;
  }

  const data = await getTrendingAnime(1);
  cache.trending = { data, timestamp: now };
  return data;
}

export async function getCachedSeasonalAnime(season: string, year: number) {
  const cacheKey = `${season}-${year}`;
  const now = Date.now();
  
  if (cache.seasonal && now - cache.seasonal.timestamp < SEASONAL_CACHE_DURATION) {
    return cache.seasonal.data;
  }

  const data = await getSeasonalAnime(season, year);
  cache.seasonal = { data, timestamp: now };
  return data;
}