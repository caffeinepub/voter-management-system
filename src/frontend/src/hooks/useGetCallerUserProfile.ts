import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';
import { useEffect, useRef } from 'react';

const STUCK_STATE_TIMEOUT_MS = 5000; // 5 seconds
const MAX_REINIT_ATTEMPTS = 2;

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const reinitAttemptsRef = useRef(0);
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null);

  console.log('[useGetCallerUserProfile] State:', {
    hasActor: !!actor,
    actorFetching,
    enabled: !!actor && !actorFetching,
  });

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Profile fetch start`);
      
      if (!actor) {
        console.error('[useGetCallerUserProfile] Actor not available in queryFn');
        throw new Error('Actor not available');
      }

      try {
        console.log('[useGetCallerUserProfile] Calling actor.getCallerUserProfile()...');
        const profile = await Promise.race([
          actor.getCallerUserProfile(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout after 30 seconds')), 30000)
          ),
        ]);
        
        const completeTimestamp = new Date().toISOString();
        console.log(`[${completeTimestamp}] Profile fetch complete:`, {
          hasProfile: profile !== null,
          profileData: profile,
        });
        
        return profile;
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Profile fetch failed:`, {
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  // Detect stuck state and force re-initialization
  useEffect(() => {
    if (actorFetching && !actor) {
      // Actor is stuck in fetching state
      stuckTimerRef.current = setTimeout(() => {
        if (reinitAttemptsRef.current < MAX_REINIT_ATTEMPTS) {
          reinitAttemptsRef.current += 1;
          console.log(`[${new Date().toISOString()}] Forcing actor re-initialization (attempt ${reinitAttemptsRef.current}/${MAX_REINIT_ATTEMPTS})`);
          
          // Invalidate actor query to force re-initialization
          queryClient.invalidateQueries({ queryKey: ['actor'] });
        } else {
          console.error(`[${new Date().toISOString()}] Profile loading failed after ${MAX_REINIT_ATTEMPTS} re-initialization attempts`);
        }
      }, STUCK_STATE_TIMEOUT_MS);
    } else {
      // Clear timer if actor becomes available
      if (stuckTimerRef.current) {
        clearTimeout(stuckTimerRef.current);
        stuckTimerRef.current = null;
      }
      
      // Reset reinit attempts when actor is ready
      if (actor && !actorFetching) {
        reinitAttemptsRef.current = 0;
      }
    }

    return () => {
      if (stuckTimerRef.current) {
        clearTimeout(stuckTimerRef.current);
      }
    };
  }, [actorFetching, actor, queryClient]);

  console.log('[useGetCallerUserProfile] Query state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetched: query.isFetched,
    isError: query.isError,
    error: query.error,
    data: query.data,
  });

  // Custom loading state that accounts for actor initialization
  const isLoading = actorFetching || query.isLoading;
  
  // Only consider fetched if actor is available AND query has completed
  const isFetched = !!actor && !actorFetching && query.isFetched;

  console.log('[useGetCallerUserProfile] Computed state:', {
    isLoading,
    isFetched,
  });

  return {
    ...query,
    isLoading,
    isFetched,
  };
}
