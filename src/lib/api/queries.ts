export const animeDetailsFragment = `
  fragment AnimeDetails on Media {
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
`;

export const getLatestAnimeQuery = `
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
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;

export const getAnimeByIdQuery = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ...AnimeDetails
    }
  }
  ${animeDetailsFragment}
`;

export const getAnimeByGenreQuery = `
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
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;

export const searchAnimeQuery = `
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
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;

export const getRecommendationsQuery = `
  query ($genre: String, $tags: [String]) {
    Page(page: 1, perPage: 10) {
      media(type: ANIME, genre: $genre, tag_in: $tags, sort: POPULARITY_DESC) {
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;

export const getSeasonalAnimeQuery = `
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
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;

export const getTrendingAnimeQuery = `
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
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;

export const getPopularAnimeQuery = `
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
        ...AnimeDetails
      }
    }
  }
  ${animeDetailsFragment}
`;