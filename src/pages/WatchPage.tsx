import { useParams } from 'react-router-dom';
import { VideoPlayer } from '@/components/anime/VideoPlayer';

export function WatchPage() {
  const { episodeId } = useParams<{ episodeId: string }>();

  if (!episodeId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Episode not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <VideoPlayer episodeId={episodeId} />
    </div>
  );
}
