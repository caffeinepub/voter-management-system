import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldX, LogOut } from 'lucide-react';
import { Button } from './ui/button';

export default function AccessDeniedScreen() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div
        className="w-full max-w-md p-8 rounded-2xl border shadow-lg text-center space-y-6"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'var(--destructive)', opacity: 0.1 }}
          />
          <ShieldX
            className="w-12 h-12 absolute"
            style={{ color: 'var(--destructive)', marginTop: '1rem' }}
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-bold text-2xl" style={{ color: 'var(--foreground)' }}>
            Access Denied
          </h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            You do not have permission to access this system. Please contact an administrator.
          </p>
        </div>

        {identity && (
          <div
            className="p-3 rounded-lg text-left"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Your Principal ID:
            </p>
            <p className="text-xs font-mono break-all" style={{ color: 'var(--foreground)' }}>
              {identity.getPrincipal().toString()}
            </p>
          </div>
        )}

        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
