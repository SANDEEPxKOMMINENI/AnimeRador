import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AMV } from '@/types';

interface AMVPlayerProps {
  amv: AMV;
  onClose: () => void;
}

export function AMVPlayer({ amv, onClose }: AMVPlayerProps) {
  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{amv.title}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="aspect-video overflow-hidden rounded-lg bg-black">
        <iframe
          src={amv.embedUrl}
          title={amv.title}
          width="100%"
          height="100%"
          allowFullScreen
          className="border-0"
        />
      </div>
    </div>
  );
}
