import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useListStore, type WatchStatus } from '@/store/useListStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Heart, Plus, Check, List, Star, Play, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Anime } from '@/types';

const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  completed: 'Completed',
  planToWatch: 'Plan to Watch',
  dropped: 'Dropped',
};

interface WatchlistControlsProps {
  anime: Anime;
}

export function WatchlistControls({ anime }: WatchlistControlsProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const {
    addToList,
    removeFromList,
    updateStatus,
    updateProgress,
    updateRating,
    toggleFavorite,
    getListItem,
    isFavorite,
    fetchUserLists,
  } = useListStore();

  useEffect(() => {
    if (user) {
      fetchUserLists();
    }
  }, [user, fetchUserLists]);

  const listItem = getListItem(anime.id);
  const favorite = isFavorite(anime.id);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progress, setProgress] = useState(listItem?.progress || 0);
  const [rating, setRating] = useState(listItem?.rating || 0);

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link to="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Sign in to track
        </Link>
      </Button>
    );
  }

  const handleStatusChange = async (status: WatchStatus) => {
    try {
      if (!listItem) {
        await addToList(anime, status);
        toast({
          title: 'Added to list',
          description: `${anime.title} added to ${STATUS_LABELS[status].toLowerCase()}`,
        });
      } else if (listItem.status === status) {
        await removeFromList(anime.id);
        toast({
          title: 'Removed from list',
          description: `${anime.title} removed from your list`,
        });
      } else {
        await updateStatus(anime.id, status);
        toast({
          title: 'Status updated',
          description: `${anime.title} moved to ${STATUS_LABELS[status].toLowerCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update list. Please try again.',
        variant: 'destructive',
      });
    }
    setIsStatusOpen(false);
  };

  const handleProgressSave = async () => {
    try {
      await updateProgress(anime.id, progress);
      if (rating) await updateRating(anime.id, rating);
      toast({
        title: 'Progress updated',
        description: `Progress for ${anime.title} has been updated`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive',
      });
    }
    setIsProgressOpen(false);
  };

  const handleFavoriteToggle = async () => {
    try {
      await toggleFavorite(anime.id);
      toast({
        title: favorite ? 'Removed from favorites' : 'Added to favorites',
        description: `${anime.title} ${favorite ? 'removed from' : 'added to'} favorites`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={favorite ? 'default' : 'outline'}
        size="icon"
        onClick={handleFavoriteToggle}
        className="flex-none"
      >
        <Heart className={favorite ? 'fill-current' : ''} />
      </Button>

      <DropdownMenu open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex-1">
            {listItem ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {STATUS_LABELS[listItem.status]}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to List
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status as WatchStatus)}
            >
              {listItem?.status === status ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <List className="mr-2 h-4 w-4" />
              )}
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {listItem && (
        <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
          <Button variant="outline" onClick={() => setIsProgressOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            {progress}/{anime.episodes || '?'}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Episodes Watched</label>
                <Input
                  type="number"
                  min={0}
                  max={anime.episodes || undefined}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
              <Button onClick={handleProgressSave} className="w-full">
                Save Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}