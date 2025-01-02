export interface StreamingSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface Subtitle {
  url: string;
  lang: string;
}

export interface StreamingData {
  sources: StreamingSource[];
  subtitles: Subtitle[];
  headers?: Record<string, string>;
  provider?: string;
}

export interface StreamingError {
  code: string;
  message: string;
  status: number;
}