export const STREAMING_CONFIG = {
  // Update base URLs to go through our proxy
  BASE_URL: '/api/streaming',
  BACKUP_URL: '/api/streaming/backup',
  TIMEOUT: 10000,
  EPISODES_PER_PAGE: 50,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  FALLBACK_EPISODES: {
    enabled: true,
    count: 12,
    thumbnailTemplate: '/images/fallback/episode-{number}.jpg'
  }
};