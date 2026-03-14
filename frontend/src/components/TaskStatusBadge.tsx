import { TaskStatus } from '../backend';
import { Badge } from '@/components/ui/badge';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  if (status === TaskStatus.pending) {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
  } else if (status === TaskStatus.inProgress) {
    return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
  } else if (status === TaskStatus.completed) {
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
  }
  return <Badge variant="secondary">Unknown</Badge>;
}
