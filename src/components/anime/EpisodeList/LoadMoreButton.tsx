import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function LoadMoreButton({ onClick, isLoading }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        onClick={onClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More Episodes'
        )}
      </Button>
    </div>
  );
}