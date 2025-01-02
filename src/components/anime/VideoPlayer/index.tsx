import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { Loader, AlertTriangle } from 'lucide-react';
import { VideoControls } from './VideoControls';
import { useVideoPlayer } from './useVideoPlayer';
import { getEpisodeStreaming } from '@/lib/api/streaming';
import { Button } from '@/components/ui/Button';
import type { StreamingSource } from '@/lib/api/streaming/types';

interface VideoPlayerProps {
  episodeId: string;
}

export function VideoPlayer({ episodeId }: VideoPlayerProps) {
  const {
    videoRef,
    selectedQuality,
    setSelectedQuality,
    selectedSubtitle,
    setSelectedSubtitle,
    initializeHLS,
    initializeNativeVideo,
    toast
  } = useVideoPlayer();

  const { data, isLoading, error, refetch } = useQuery(
    ['streaming', episodeId],
    () => getEpisodeStreaming(episodeId),
    {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      onError: () => {
        toast({
          title: 'Streaming Error',
          description: 'Failed to load video. Trying backup sources...',
          variant: 'warning'
        });
      }
    }
  );

  // Set initial quality
  useEffect(() => {
    if (data?.sources?.length && !selectedQuality) {
      const defaultSource = [...data.sources]
        .sort((a, b) => {
          const qualityA = parseInt(a.quality.replace('p', ''));
          const qualityB = parseInt(b.quality.replace('p', ''));
          return qualityB - qualityA;
        })[0];
      setSelectedQuality(defaultSource.quality);
    }
  }, [data?.sources, selectedQuality, setSelectedQuality]);

  // Initialize video player
  useEffect(() => {
    if (!videoRef.current || !data?.sources) return;

    const source = data.sources.find(s => s.quality === selectedQuality);
    if (!source) return;

    const initializeVideo = async () => {
      try {
        if (source.isM3U8) {
          await initializeHLS(source, data.headers);
        } else {
          initializeNativeVideo(source);
        }
      } catch (error) {
        console.error('Video initialization error:', error);
        toast({
          title: 'Playback Error',
          description: 'Failed to initialize video player',
          variant: 'destructive'
        });
      }
    };

    initializeVideo();
  }, [selectedQuality, data, initializeHLS, initializeNativeVideo, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <h3 className="font-semibold">Streaming Error</h3>
        <p className="text-sm mt-1">Please try again in a few moments</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          className="h-full w-full"
          controls
          playsInline
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <VideoControls
        sources={data.sources}
        subtitles={data.subtitles}
        selectedQuality={selectedQuality}
        selectedSubtitle={selectedSubtitle}
        onQualityChange={setSelectedQuality}
        onSubtitleChange={setSelectedSubtitle}
      />
    </div>
  );
}