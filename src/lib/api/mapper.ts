import { decode } from 'html-entities';
import type { AnimeResponse } from '@/types/api';
import type { Anime } from '@/types';

export function mapAnimeResponse(anime: AnimeResponse): Anime {
  return {
    id: anime.id.toString(),
    title: anime.title.english || anime.title.romaji,
    nativeTitle: anime.title.native,
    description: decode(anime.description || ''),
    releaseYear: anime.seasonYear,
    genres: anime.genres,
    tags: anime.tags,
    rating: anime.averageScore / 10,
    popularity: anime.popularity,
    episodes: anime.episodes,
    duration: anime.duration,
    status: anime.status,
    source: anime.source,
    trailer: anime.trailer,
    poster: anime.coverImage.extraLarge || anime.coverImage.large,
    banner: anime.bannerImage,
    nextEpisode: anime.nextAiringEpisode,
    studios: anime.studios.nodes.map((studio) => studio.name),
    externalLinks: anime.externalLinks,
    reviews: anime.reviews.nodes.map((review) => ({
      id: review.id.toString(),
      summary: review.summary,
      score: review.score,
      userName: review.user.name,
      userAvatar: review.user.avatar.medium,
      createdAt: review.createdAt,
    })),
  };
}