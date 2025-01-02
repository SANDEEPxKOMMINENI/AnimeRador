import axios from 'axios';

const CONSUMET_API = 'https://api.consumet.org/anime';

export interface Episode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  image?: string;
  duration?: string;
}

export interface StreamingSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface Subtitle {
  url: string;
  lang: string;
}

export async function getAnimeEpisodes(animeId: string, page = 1): Promise<{
  episodes: Episode[];
  hasNextPage: boolean;
}> {
  try {
    const response = await axios.get(`${CONSUMET_API}/gogoanime/info/${animeId}`);
    const episodes = response.data.episodes || [];
    
    // Paginate episodes (50 per page)
    const startIdx = (page - 1) * 50;
    const endIdx = startIdx + 50;
    
    // Ensure we only return serializable data
    const serializedEpisodes = episodes.slice(startIdx, endIdx).map((ep: any) => ({
      id: String(ep.id),
      number: Number(ep.number),
      title: ep.title || undefined,
      image: ep.image || undefined,
      description: ep.description || undefined,
      duration: ep.duration || undefined,
    }));

    return {
      episodes: serializedEpisodes,
      hasNextPage: endIdx < episodes.length
    };
  } catch (error) {
    console.error('Error fetching episodes:', error);
    throw new Error('Failed to fetch episodes');
  }
}

export async function getEpisodeStreaming(episodeId: string): Promise<{
  sources: StreamingSource[];
  subtitles: Subtitle[];
}> {
  try {
    const response = await axios.get(`${CONSUMET_API}/gogoanime/watch/${episodeId}`);
    return {
      sources: (response.data.sources || []).map((source: any) => ({
        url: String(source.url),
        quality: String(source.quality),
        isM3U8: Boolean(source.isM3U8)
      })),
      subtitles: (response.data.subtitles || []).map((sub: any) => ({
        url: String(sub.url),
        lang: String(sub.lang)
      }))
    };
  } catch (error) {
    console.error('Error fetching streaming data:', error);
    throw new Error('Failed to fetch streaming data');
  }
}