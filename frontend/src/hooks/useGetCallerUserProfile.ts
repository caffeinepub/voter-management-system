import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity && !isInitializing;
  const isReady = isAuthenticated && !!actor && !actorFetching;

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        if (
          msg.includes('Unauthorized') ||
          msg.includes('not authenticated') ||
          msg.includes('Anonymous')
        ) {
          return null;
        }
        throw err;
      }
    },
    enabled: isReady,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    // isLoading should reflect actor/auth initialization too
    isLoading: !isReady || query.isLoading,
    // isFetched is only meaningful once the actor was ready when the query ran
    isFetched: isReady && query.isFetched,
  };
}
