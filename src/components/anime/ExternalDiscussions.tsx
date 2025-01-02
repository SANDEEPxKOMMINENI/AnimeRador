import { useQuery } from 'react-query';
import { MessageCircle, ArrowUpRight, Loader } from 'lucide-react';
import { getExternalReviews } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import type { RedditPost } from '@/types';

interface ExternalDiscussionsProps {
  animeTitle: string;
}

export function ExternalDiscussions({ animeTitle }: ExternalDiscussionsProps) {
  const { data, isLoading } = useQuery(
    ['external-reviews', animeTitle],
    () => getExternalReviews(animeTitle)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.redditPosts.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Reddit Discussions</h2>
      <div className="space-y-4">
        {data.redditPosts.map((post: RedditPost) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-medium">{post.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{post.score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.numComments} comments</span>
                  </div>
                  <span>{formatDistanceToNow(post.created)} ago</span>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}