import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useListStore, type WatchStatus } from '@/store/useListStore';
import { Plus, Check, List, ChevronDown } from 'lucide-react';
import type { Anime } from '@/types';

const STATUS_LABELS: Record<WatchStatus, string> = {
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped',
  PLAN_TO_WATCH: 'Plan to Watch',
};

interface WatchlistButtonProps {
  anime: Anime;
}

export function WatchlistButton({ anime }: WatchlistButtonProps) {
  const { addToWatchlist, updateWatchStatus, removeFromWatchlist, getWatchlistItem } = useListStore();
  const watchlistItem = getWatchlistItem(anime.id);
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (status: WatchStatus) => {
    if (!watchlistItem) {
      addToWatchlist(anime, status);
    } else if (watchlistItem.status === status) {
      removeFromWatchlist(anime.id);
    } else {
      updateWatchStatus(anime.id, status);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          {watchlistItem ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {STATUS_LABELS[watchlistItem.status]}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add to List
            </>
          )}
          <ChevronDown className="ml-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status as WatchStatus)}
            className="flex items-center"
          >
            {watchlistItem?.status === status ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <List className="mr-2 h-4 w-4" />
            )}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}