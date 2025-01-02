import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useToast } from '@/components/ui/Toast';
import type { StreamingSource } from '@/lib/api/streaming/types';

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('');
  const [hls, setHls] = useState<Hls | null>(null);
  const { toast } = useToast();

  const initializeHLS = async (source: StreamingSource, headers?: Record<string, string>) => {
    if (!videoRef.current) return;

    try {
      // Clean up existing HLS instance
      if (hls) {
        hls.destroy();
      }

      // Create new HLS instance
      const newHls = new Hls({
        xhrSetup: (xhr) => {
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }
        },
        maxLoadingRetry: 4,
        manifestLoadingRetryDelay: 1000,
        levelLoadingRetryDelay: 1000,
        fragLoadingRetryDelay: 1000,
      });

      // Handle HLS errors
      newHls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              newHls.startLoad(); // Try to recover on network errors
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              newHls.recoverMediaError(); // Try to recover on media errors
              break;
            default:
              toast({
                title: 'Playback Error',
                description: 'Failed to load video. Please try again.',
                variant: 'destructive',
              });
              break;
          }
        }
      });

      newHls.loadSource(source.url);
      newHls.attachMedia(videoRef.current);
      setHls(newHls);

      return new Promise((resolve, reject) => {
        newHls.on(Hls.Events.MANIFEST_PARSED, resolve);
        newHls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) reject(data);
        });
      });
    } catch (error) {
      toast({
        title: 'Playback Error',
        description: 'Failed to initialize video player',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const initializeNativeVideo = (source: StreamingSource) => {
    if (!videoRef.current) return;
    videoRef.current.src = source.url;
    videoRef.current.load();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hls) {
        hls.destroy();
        setHls(null);
      }
    };
  }, []);

  return {
    videoRef,
    selectedQuality,
    setSelectedQuality,
    selectedSubtitle,
    setSelectedSubtitle,
    initializeHLS,
    initializeNativeVideo,
    toast
  };
}