import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Voter } from '../backend';

export function useGetVoters() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Voter[]>({
    queryKey: ['voters'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.getVoters();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
