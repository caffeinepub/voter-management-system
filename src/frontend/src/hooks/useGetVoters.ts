import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Voter } from '../backend';
import { useEffect } from 'react';

export function useGetVoters() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Voter[]>({
    queryKey: ['voters'],
    queryFn: async () => {
      console.log('[useGetVoters] Query function called');
      if (!actor) {
        console.error('[useGetVoters] Actor not available');
        throw new Error('Actor not available');
      }
      console.log('[useGetVoters] Fetching voters from backend...');
      try {
        const result = await actor.getVoters();
        console.log('[useGetVoters] Successfully fetched voters:', {
          count: result?.length ?? 'null/undefined',
          isArray: Array.isArray(result),
          firstVoter: result?.[0]
        });
        return result;
      } catch (error) {
        console.error('[useGetVoters] Error fetching voters:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 0,
  });

  // Debug logging for query state changes
  useEffect(() => {
    console.log('[useGetVoters] Query state:', {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error?.message,
      dataCount: query.data?.length ?? 'null/undefined',
      actorAvailable: !!actor,
      actorFetching
    });
  }, [query.isLoading, query.isFetching, query.isError, query.error, query.data, actor, actorFetching]);

  // Return combined loading state that accounts for actor initialization
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
