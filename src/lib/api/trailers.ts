```typescript
import axios from 'axios';

interface YoutubeVideoInfo {
  title: string;
  embedUrl: string;
  thumbnailUrl: string;
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PROXY_URLS = [
  'https://www.youtube-nocookie.com/embed/',
  'https://www.youtube.com/embed/',
  'https://invidious.snopyta.org/embed/',
  'https://invidio.xamh.de/embed/',
];

export async function getEnhancedTrailer(videoId: string): Promise<YoutubeVideoInfo | null> {
  try {
    // Try to get video info from YouTube API
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,status&key=${YOUTUBE_API_KEY}`
    );

    const video = response.data.items[0];
    if (!video) return null;

    // Check if video is available
    if (video.status.embeddable === false) {
      // If not embeddable, try alternative sources
      return {
        title: video.snippet.title,
        embedUrl: await findWorkingProxyUrl(videoId),
        thumbnailUrl: video.snippet.thumbnails.maxres?.url || 
                     video.snippet.thumbnails.high?.url ||
                     `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    }

    return {
      title: video.snippet.title,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || 
                   video.snippet.thumbnails.high?.url ||
                   `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    // Fallback to direct embed with proxy
    return {
      title: 'Anime Trailer',
      embedUrl: await findWorkingProxyUrl(videoId),
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }
}

async function findWorkingProxyUrl(videoId: string): Promise<string> {
  for (const baseUrl of PROXY_URLS) {
    try {
      const url = `${baseUrl}${videoId}`;
      await axios.head(url);
      return url;
    } catch {
      continue;
    }
  }
  // Fallback to first proxy if none work
  return `${PROXY_URLS[0]}${videoId}`;
}
```