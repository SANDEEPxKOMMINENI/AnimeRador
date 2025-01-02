import type { Episode } from '../types';

export function mapEpisodeResponse(episode: any): Episode {
  return {
    id: String(episode.id || ''),
    number: Number(episode.number || 0),
    title: episode.title || undefined,
    image: episode.image || undefined,
    description: episode.description || undefined,
    duration: episode.duration || undefined,
  };
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