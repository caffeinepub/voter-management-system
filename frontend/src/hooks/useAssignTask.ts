import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Role, ExternalBlob } from '../backend';

interface AssignTaskParams {
  title: string;
  description: string;
  deadline: string;
  assignedTo: Role;
  attachments: ExternalBlob[];
}

export function useAssignTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AssignTaskParams) => {
      if (!actor) throw new Error('Actor not available');

      return actor.assignTask(
        params.title,
        params.description,
        params.deadline,
        params.assignedTo,
        params.attachments
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
