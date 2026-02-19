import { Task, TaskStatus, Role } from '../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TaskStatusBadge from './TaskStatusBadge';
import { FileText } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No tasks found</p>
        <p className="text-sm mt-2">Create your first task to get started</p>
      </div>
    );
  }

  const getRoleLabel = (role: Role) => {
    if (role === Role.admin) return 'Admin';
    if (role === Role.supervisor) return 'Supervisor';
    if (role === Role.karyakarta) return 'Karyakarta';
    return 'Unknown';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Attachments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id.toString()} 
              className="cursor-pointer hover:bg-accent"
              onClick={() => onTaskClick(task)}
            >
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell className="max-w-xs truncate">{task.description}</TableCell>
              <TableCell>{getRoleLabel(task.assignedTo)}</TableCell>
              <TableCell>{formatDate(task.deadline)}</TableCell>
              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>
              <TableCell className="text-center">
                {task.attachments.length > 0 && (
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{task.attachments.length}</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
