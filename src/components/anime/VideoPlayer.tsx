import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { getEpisodeStreaming } from '@/lib/api/streaming';
import type { StreamingSource, Subtitle } from '@/lib/api/streaming';

interface VideoPlayerProps {
  episodeId: string;
}

export function VideoPlayer({ episodeId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('');

  const { data, isLoading, error } = useQuery(
    ['streaming', episodeId],
    () => getEpisodeStreaming(episodeId)
  );

  useEffect(() => {
    if (data?.sources.length) {
      // Default to highest quality
      const defaultSource = data.sources
        .sort((a, b) => {
          const qualityA = parseInt(a.quality.replace('p', ''));
          const qualityB = parseInt(b.quality.replace('p', ''));
          return qualityB - qualityA;
        })[0];
      setSelectedQuality(defaultSource.quality);
    }
  }, [data]);

  useEffect(() => {
    if (videoRef.current && data?.sources) {
      const source = data.sources.find(s => s.quality === selectedQuality);
      if (source) {
        videoRef.current.src = source.url;
        videoRef.current.load();
      }
    }
  }, [selectedQuality, data]);

  useEffect(() => {
    if (videoRef.current && data?.subtitles) {
      // Remove existing subtitles
      while (videoRef.current.firstChild) {
        videoRef.current.removeChild(videoRef.current.firstChild);
      }

      // Add selected subtitle track
      if (selectedSubtitle) {
        const subtitle = data.subtitles.find(s => s.lang === selectedSubtitle);
        if (subtitle) {
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.label = subtitle.lang;
          track.src = subtitle.url;
          track.default = true;
          videoRef.current.appendChild(track);
        }
      }
    }
  }, [selectedSubtitle, data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load video. Please try again later.</p>
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
          autoPlay
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Quality:</span>
          <Select
            value={selectedQuality}
            onValueChange={setSelectedQuality}
          >
            {data.sources.map((source: StreamingSource) => (
              <option key={source.quality} value={source.quality}>
                {source.quality}
              </option>
            ))}
          </Select>
        </div>

        {data.subtitles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Subtitles:</span>
            <Select
              value={selectedSubtitle}
              onValueChange={setSelectedSubtitle}
            >
              <option value="">None</option>
              {data.subtitles.map((subtitle: Subtitle) => (
                <option key={subtitle.lang} value={subtitle.lang}>
                  {subtitle.lang}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}