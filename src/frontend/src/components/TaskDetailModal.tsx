import { Task, Role } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, FileText } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskStatusUpdater from './TaskStatusUpdater';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const getRoleLabel = (role: Role) => {
    if (role === Role.admin) return 'Admin';
    if (role === Role.supervisor) return 'Supervisor';
    if (role === Role.karyakarta) return 'Karyakarta';
    return 'Unknown';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Task Details</span>
            <Button onClick={onClose} size="sm" variant="ghost">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
              <p className="text-base">{getRoleLabel(task.assignedTo)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deadline</p>
              <p className="text-base">{formatDate(task.deadline)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                <TaskStatusBadge status={task.status} />
              </div>
            </div>
          </div>

          <TaskStatusUpdater task={task} />

          {task.attachments.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Attachments</p>
              <div className="space-y-2">
                {task.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Attachment {index + 1}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = attachment.getDirectURL();
                        window.open(url, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
