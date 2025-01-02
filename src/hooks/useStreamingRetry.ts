import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useStreamingRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const retry = async (retryFn: () => Promise<any>) => {
    if (retryCount >= MAX_RETRIES) {
      toast({
        title: 'Maximum retries reached',
        description: 'Please try again later',
        variant: 'warning',
      });
      return;
    }

    setIsRetrying(true);
    try {
      setRetryCount(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await retryFn();
    } catch (error) {
      toast({
        title: 'Retry failed',
        description: 'Unable to connect to streaming providers',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const reset = () => {
    setRetryCount(0);
    setIsRetrying(false);
  };

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    hasRetriesLeft: retryCount < MAX_RETRIES
  };
}