import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAssignTask } from '../hooks/useAssignTask';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { ExternalBlob, Role } from '../backend';

interface CreateTaskFormProps {
  onClose: () => void;
}

type TaskFormData = {
  title: string;
  description: string;
  deadline: string;
};

export default function CreateTaskForm({ onClose }: CreateTaskFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>();
  const { mutate: assignTask, isPending } = useAssignTask();
  const { data: userProfile } = useGetCallerUserProfile();
  const [assignedTo, setAssignedTo] = useState<Role>(Role.supervisor);
  const [attachments, setAttachments] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: ExternalBlob[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(prev => ({ ...prev, [attachments.length + i]: percentage }));
      });
      newAttachments.push(blob);
    }

    setAttachments([...attachments, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const onSubmit = (data: TaskFormData) => {
    assignTask(
      {
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        assignedTo: assignedTo,
        attachments,
      },
      {
        onSuccess: () => {
          toast.success('Task assigned successfully!');
          reset();
          setAttachments([]);
          setUploadProgress({});
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to assign task: ${error.message}`);
        },
      }
    );
  };

  // Determine available roles based on current user
  const availableRoles = userProfile?.role === 'Admin' 
    ? [{ value: Role.supervisor, label: 'Supervisor' }, { value: Role.karyakarta, label: 'Karyakarta' }]
    : [{ value: Role.karyakarta, label: 'Karyakarta' }];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter task title"
              disabled={isPending}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Enter task description"
              rows={4}
              disabled={isPending}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">
              Deadline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deadline"
              type="date"
              {...register('deadline', { required: 'Deadline is required' })}
              disabled={isPending}
            />
            {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">
              Assign To <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={assignedTo} 
              onValueChange={(value: Role) => setAssignedTo(value)} 
              disabled={isPending}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isPending}
            />
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Attachment {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                        <span className="text-xs text-muted-foreground">
                          {uploadProgress[index]}%
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        disabled={isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
