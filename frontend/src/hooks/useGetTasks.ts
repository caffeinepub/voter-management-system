import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Task } from '../backend';

export function useGetTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
