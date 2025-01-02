
import axios from 'axios';
import { AMV } from '@/types';

// AMV sources
const AMV_SOURCES = [
  'https://www.dailymotion.com/embed/video/',
  'https://www.bilibili.tv/embed/',
  'https://streamable.com/e/',
  'https://vimeo.com/'
];

export async function getAnimeAMVs(title: string): Promise<AMV[]> {
  try {
    // Search AMVs across multiple platforms
    const response = await axios.get('/api/amv/search', {
      params: {
        query: `${title} AMV`,
        limit: 5
      }
    });

    return response.data.videos.map((video: any) => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      embedUrl: getEmbedUrl(video.url, video.platform),
      platform: video.platform,
      duration: video.duration
    }));
  } catch (error) {
    console.error('Failed to fetch AMVs:', error);
    return [];
  }
}

function getEmbedUrl(url: string, platform: string): string {
  // Handle different platform embed URLs
  switch (platform) {
    case 'dailymotion':
      return `${AMV_SOURCES[0]}${url}`;
    case 'bilibili':
      return `${AMV_SOURCES[1]}${url}`;
    case 'streamable':
      return `${AMV_SOURCES[2]}${url}`;
    case 'vimeo':
      return `${AMV_SOURCES[3]}${url}`;
    default:
      return url;
  }
}
