import { Play } from 'lucide-react';
import type { AMV } from '@/types';

interface AMVThumbnailProps {
  amv: AMV;
  onClick: () => void;
}

export function AMVThumbnail({ amv, onClick }: AMVThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black"
    >
      <img
        src={amv.thumbnail}
        alt={amv.title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <Play className="h-12 w-12 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-2">
        <p className="line-clamp-1 text-sm text-white">{amv.title}</p>
        {amv.duration && (
          <p className="text-xs text-white/80">{formatDuration(amv.duration)}</p>
        )}
      </div>
    </button>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
