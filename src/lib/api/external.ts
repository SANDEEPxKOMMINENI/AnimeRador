import axios from 'axios';
import { REDDIT_API } from './client';
import { handleError } from './errors';
import type { RedditPost } from '@/types';

interface RedditResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        permalink: string;
        score: number;
        num_comments: number;
        created_utc: number;
      };
    }>;
  };
}

export async function getExternalReviews(title: string) {
  try {
    const response = await axios.get<RedditResponse>(REDDIT_API, {
      params: {
        q: `${title} discussion`,
        restrict_sr: true,
        sort: 'relevance',
        t: 'all',
        limit: 5,
      },
    });

    return {
      redditPosts: response.data.data.children.map((post): RedditPost => ({
        id: post.data.id,
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score,
        numComments: post.data.num_comments,
        created: post.data.created_utc * 1000,
      })),
    };
  } catch (error) {
    return handleError(error);
  }
}