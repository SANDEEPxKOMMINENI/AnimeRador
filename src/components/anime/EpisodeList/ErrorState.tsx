import { AlertTriangle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  error: any;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-6 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-600/70" />
      <h3 className="mt-4 text-lg font-semibold text-yellow-600">
        {error?.code === 'PROVIDERS_UNAVAILABLE' 
          ? 'Episodes Temporarily Unavailable'
          : 'Unable to Load Episodes'}
      </h3>
      <p className="mt-2 text-sm text-yellow-600/90">
        {error?.code === 'PROVIDERS_UNAVAILABLE'
          ? 'Our streaming providers are currently experiencing issues. Please try again in a few moments.'
          : 'We encountered an error while loading the episodes. Please try again.'}
      </p>
      <div className="mt-4 flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            'Try Again'
          )}
        </Button>
      </div>
    </div>
  );
}