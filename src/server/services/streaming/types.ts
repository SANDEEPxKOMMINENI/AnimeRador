import type { Episode, StreamingData } from '@/types';

export interface StreamingProvider {
  getEpisodes(animeId: string): Promise<Episode[]>;
  getStreamingSources(episodeId: string): Promise<StreamingData>;
}

export interface ProviderResponse<T> {
  data: T;
  provider: string;
  error?: {
    message: string;
    code: string;
    status: number;
  };
}