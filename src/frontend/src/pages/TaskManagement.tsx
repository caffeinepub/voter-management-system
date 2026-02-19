import { useState } from 'react';
import { useGetTasks } from '../hooks/useGetTasks';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import TaskTable from '../components/TaskTable';
import CreateTaskForm from '../components/CreateTaskForm';
import TaskDetailModal from '../components/TaskDetailModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardList, AlertCircle, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Task, Role } from '../backend';

export default function TaskManagement() {
  const { data: tasks, isLoading, error } = useGetTasks();
  const { data: userProfile } = useGetCallerUserProfile();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const canCreateTask = userProfile?.role === 'Admin' || userProfile?.role === 'Supervisor';

  // Filter tasks based on user role
  const filteredTasks = tasks?.filter((task) => {
    if (userProfile?.role === 'Admin') {
      return true; // Admin sees all tasks
    } else if (userProfile?.role === 'Supervisor') {
      // Supervisor sees tasks assigned to them and tasks they created
      return task.assignedTo === Role.supervisor || task.assignedBy.toString() === userProfile?.name;
    } else if (userProfile?.role === 'Karyakarta') {
      // Karyakarta sees only tasks assigned to them
      return task.assignedTo === Role.karyakarta;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground mt-1">Assign and track tasks</p>
          </div>
        </div>
        {canCreateTask && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load tasks: {error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `Total: ${filteredTasks?.length || 0} task${filteredTasks?.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <TaskTable tasks={filteredTasks || []} onTaskClick={setSelectedTask} />
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <CreateTaskForm onClose={() => setShowCreateForm(false)} />
      )}

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
