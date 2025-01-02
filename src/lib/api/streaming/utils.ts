import type { Episode, StreamingSource, Subtitle } from './types';

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validateEpisodeData(episode: Episode): boolean {
  return (
    typeof episode.id === 'string' &&
    typeof episode.number === 'number' &&
    (!episode.title || typeof episode.title === 'string') &&
    (!episode.image || typeof episode.image === 'string') &&
    (!episode.description || typeof episode.description === 'string') &&
    (!episode.duration || typeof episode.duration === 'string')
  );
}

export function validateStreamingSource(source: StreamingSource): boolean {
  return (
    typeof source.url === 'string' &&
    typeof source.quality === 'string' &&
    typeof source.isM3U8 === 'boolean'
  );
}

export function validateSubtitle(subtitle: Subtitle): boolean {
  return (
    typeof subtitle.url === 'string' &&
    typeof subtitle.lang === 'string'
  );
}

export function sortStreamingSources(sources: StreamingSource[]): StreamingSource[] {
  return [...sources].sort((a, b) => {
    const qualityA = parseInt(a.quality.replace('p', ''));
    const qualityB = parseInt(b.quality.replace('p', ''));
    return qualityB - qualityA;
  });
}