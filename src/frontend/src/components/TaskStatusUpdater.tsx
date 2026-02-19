import { useState } from 'react';
import { Task, TaskStatus } from '../backend';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TaskStatusUpdaterProps {
  task: Task;
}

export default function TaskStatusUpdater({ task }: TaskStatusUpdaterProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: updateStatus, isPending } = useUpdateTaskStatus();
  
  const [status, setStatus] = useState<TaskStatus>(task.status);

  // Check if current user is assigned to this task
  const isAssignedUser = () => {
    if (userProfile?.role === 'Admin' && task.assignedTo === 'admin') return true;
    if (userProfile?.role === 'Supervisor' && task.assignedTo === 'supervisor') return true;
    if (userProfile?.role === 'Karyakarta' && task.assignedTo === 'karyakarta') return true;
    return false;
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);

    updateStatus(
      { taskId: task.id, newStatus: newStatus },
      {
        onSuccess: () => {
          toast.success('Task status updated successfully');
        },
        onError: (error) => {
          toast.error(`Failed to update status: ${error.message}`);
          setStatus(task.status); // Revert on error
        },
      }
    );
  };

  if (!isAssignedUser()) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="task-status">Update Status</Label>
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger id="task-status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TaskStatus.pending}>Pending</SelectItem>
          <SelectItem value={TaskStatus.inProgress}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.completed}>Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
