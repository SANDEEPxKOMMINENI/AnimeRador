import type { StreamingData, StreamingSource, Subtitle } from '../types';

// Ensure all data is serializable
export function sanitizeStreamingData(data: any): StreamingData {
  return {
    sources: sanitizeSources(data.sources || []),
    subtitles: sanitizeSubtitles(data.subtitles || []),
    headers: sanitizeHeaders(data.headers),
    provider: data.provider?.toString(),
    notice: data.notice?.toString()
  };
}

function sanitizeSources(sources: any[]): StreamingSource[] {
  return sources.map(source => ({
    url: String(source.url || ''),
    quality: String(source.quality || '720p'),
    isM3U8: Boolean(source.isM3U8)
  }));
}

function sanitizeSubtitles(subtitles: any[]): Subtitle[] {
  return subtitles.map(subtitle => ({
    url: String(subtitle.url || ''),
    lang: String(subtitle.lang || '')
  }));
}

function sanitizeHeaders(headers: any): Record<string, string> | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value != null) {
      sanitized[key] = String(value);
    }
  }
  return sanitized;
}