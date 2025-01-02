import axios from 'axios';
import { decode } from 'html-entities';

const ANILIST_API = 'https://graphql.anilist.co';
const MAL_API = 'https://api.myanimelist.net/v2';
const REDDIT_API = 'https://www.reddit.com/r/anime/search.json';

const client = axios.create({
  baseURL: ANILIST_API,
});

// Helper function to map API response to our Anime type
export function mapAnimeResponse(anime: any) {
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
    studios: anime.studios.nodes.map((studio: any) => studio.name),
    externalLinks: anime.externalLinks,
    reviews: anime.reviews.nodes.map((review: any) => ({
      id: review.id.toString(),
      summary: review.summary,
      score: review.score,
      userName: review.user.name,
      userAvatar: review.user.avatar.medium,
      createdAt: review.createdAt,
    })),
  };
}

// Get latest anime
export async function getLatestAnime(page = 1) {
  const response = await client.post('', {
    query: `
      query ($page: Int) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, status: RELEASING, sort: UPDATED_AT_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: { page },
  });

  return response.data.data.Page;
}

// Get anime by ID
export async function getAnimeById(id: string) {
  const response = await client.post('', {
    query: `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          seasonYear
          genres
          tags {
            name
            rank
          }
          averageScore
          popularity
          episodes
          duration
          status
          source
          trailer {
            id
            site
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          nextAiringEpisode {
            episode
            airingAt
          }
          studios {
            nodes {
              name
            }
          }
          externalLinks {
            url
            site
          }
          reviews {
            nodes {
              id
              summary
              score
              user {
                name
                avatar {
                  medium
                }
              }
              createdAt
            }
          }
        }
      }
    `,
    variables: { id: parseInt(id) },
  });

  return response.data.data.Media;
}

// Get anime by genre
export async function getAnimeByGenre(genre: string, page = 1) {
  const response = await client.post('', {
    query: `
      query ($page: Int, $genre: String) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: { page, genre },
  });

  return response.data.data.Page;
}

// Search anime
export async function searchAnime(query: string) {
  const response = await client.post('', {
    query: `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, search: $search) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: { search: query },
  });

  return response.data.data.Page;
}

// Get recommendations
export async function getRecommendations(genre: string, tags: string[]) {
  const response = await client.post('', {
    query: `
      query ($genre: String, $tags: [String]) {
        Page(page: 1, perPage: 10) {
          media(type: ANIME, genre: $genre, tag_in: $tags, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: { genre, tags },
  });

  return response.data.data.Page;
}

// Get external reviews (Reddit discussions)
export async function getExternalReviews(title: string) {
  const response = await axios.get(REDDIT_API, {
    params: {
      q: `${title} discussion`,
      restrict_sr: true,
      sort: 'relevance',
      t: 'all',
      limit: 5,
    },
  });

  return {
    redditPosts: response.data.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      score: post.data.score,
      numComments: post.data.num_comments,
      created: post.data.created_utc * 1000,
    })),
  };
}

// Get seasonal anime
export async function getSeasonalAnime(season: string, year: number, page = 1, sortBy = 'POPULARITY_DESC') {
  const response = await client.post('', {
    query: `
      query ($season: MediaSeason, $year: Int, $page: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, season: $season, seasonYear: $year, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: {
      season,
      year,
      page,
      sort: [sortBy],
    },
  });

  return response.data.data.Page;
}

// Get trending anime
export async function getTrendingAnime(page = 1) {
  const response = await client.post('', {
    query: `
      query ($page: Int) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: { page },
  });

  return response.data.data.Page;
}

// Get popular anime
export async function getPopularAnime(page = 1, sortBy = 'POPULARITY_DESC') {
  const response = await client.post('', {
    query: `
      query ($page: Int, $sort: [MediaSort]) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: $sort) {
            id
            title {
              romaji
              english
              native
            }
            description
            seasonYear
            genres
            tags {
              name
              rank
            }
            averageScore
            popularity
            episodes
            duration
            status
            source
            trailer {
              id
              site
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            nextAiringEpisode {
              episode
              airingAt
            }
            studios {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
            reviews {
              nodes {
                id
                summary
                score
                user {
                  name
                  avatar {
                    medium
                  }
                }
                createdAt
              }
            }
          }
        }
      }
    `,
    variables: { page, sort: [sortBy] },
  });

  return response.data.data.Page;
}