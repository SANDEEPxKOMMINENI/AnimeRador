import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useListStore } from '@/store/useListStore';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  animeId: string;
  variant?: 'default' | 'outline';
}

export function FavoriteButton({ animeId, variant = 'outline' }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useListStore();
  const favorite = isFavorite(animeId);

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={() => toggleFavorite(animeId)}
      className={cn(favorite && 'text-red-500')}
    >
      <Heart className={cn('h-5 w-5', favorite && 'fill-current')} />
    </Button>
  );
}