import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TaskStatus } from '../backend';

interface UpdateTaskStatusParams {
  taskId: bigint;
  newStatus: TaskStatus;
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateTaskStatusParams) => {
      if (!actor) throw new Error('Actor not available');

      return actor.updateTaskStatus(params.taskId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
