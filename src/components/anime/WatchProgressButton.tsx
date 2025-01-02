import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useListStore } from '@/store/useListStore';
import { Play, Star } from 'lucide-react';
import type { Anime } from '@/types';

interface WatchProgressButtonProps {
  anime: Anime;
}

export function WatchProgressButton({ anime }: WatchProgressButtonProps) {
  const { updateProgress, updateRating, getWatchlistItem } = useListStore();
  const watchlistItem = getWatchlistItem(anime.id);
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(watchlistItem?.progress || 0);
  const [rating, setRating] = useState(watchlistItem?.rating || 0);

  if (!watchlistItem) return null;

  const handleSave = () => {
    updateProgress(anime.id, progress);
    if (rating) updateRating(anime.id, rating);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Play className="mr-2 h-4 w-4" />
          Episode {watchlistItem.progress || 0}/{anime.episodes || '?'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Episodes Watched</Label>
            <Input
              type="number"
              min={0}
              max={anime.episodes || undefined}
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
              />
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Progress
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}