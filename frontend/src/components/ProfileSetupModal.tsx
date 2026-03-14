import React from 'react';
import { useForm } from 'react-hook-form';
import { useSaveCallerUserProfile } from '../hooks/useSaveCallerUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Shield, Info, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  role: string;
}

export default function ProfileSetupModal() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { mutateAsync: saveProfile, isPending, error } = useSaveCallerUserProfile();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', role: 'Karyakarta' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    try {
      await saveProfile({ name: data.name, role: data.role });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    } catch {
      // error handled below
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border shadow-lg overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ background: 'var(--primary)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" style={{ color: 'var(--primary-foreground)' }} />
              <div>
                <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--primary-foreground)' }}>
                  Complete Your Profile
                </h2>
                <p className="text-sm" style={{ color: 'var(--primary-foreground)', opacity: 0.8 }}>
                  Set up your account to get started
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Info banner */}
            <div
              className="flex gap-3 p-3 rounded-lg text-sm"
              style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                The first user to register automatically becomes the <strong>Admin</strong>.
                Subsequent users can register as Supervisor or Karyakarta.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                />
                {errors.name && (
                  <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Role *</Label>
                <Select value={selectedRole} onValueChange={(val) => setValue('role', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Karyakarta">Karyakarta</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Admin role is auto-assigned to the first registrant.
                </p>
              </div>

              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
                >
                  {(error as Error).message || 'Failed to save profile. Please try again.'}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </form>

            {identity && (
              <p className="text-xs text-center break-all" style={{ color: 'var(--muted-foreground)' }}>
                Principal: {identity.getPrincipal().toString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
