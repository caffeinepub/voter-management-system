import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const actorResult = useActor();
  const actor = actorResult.actor;
  const actorFetching = actorResult.isFetching;
  const actorError = (actorResult as any).error;
  const actorIsError = (actorResult as any).isError || false;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [useGetCallerUserProfile] Starting profile query`, {
        actorAvailable: !!actor,
        actorFetching
      });

      if (!actor) {
        throw new Error('Actor not available');
      }

      try {
        console.log(`[${timestamp}] [useGetCallerUserProfile] Calling getCallerUserProfile`);
        const profile = await actor.getCallerUserProfile();
        console.log(`[${new Date().toISOString()}] [useGetCallerUserProfile] Profile fetched successfully:`, {
          hasProfile: !!profile,
          profileName: profile?.name
        });
        return profile;
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] [useGetCallerUserProfile] Profile fetch failed:`, error.message);
        throw error;
      }
    },
    // Don't enable if actor initialization failed
    enabled: !!actor && !actorFetching && !actorIsError,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Custom loading state that accounts for actor initialization
  const isLoading = actorFetching || query.isLoading;
  
  // Only consider fetched if actor is available AND query has completed
  const isFetched = !!actor && !actorFetching && query.isFetched;

  // Include actor errors in the error state
  const error = actorError || query.error;
  const isError = actorIsError || query.isError;

  return {
    ...query,
    isLoading,
    isFetched,
    error,
    isError,
  };
}
