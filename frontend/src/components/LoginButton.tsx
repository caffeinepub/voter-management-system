import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, isLoginError } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (isAuthenticated) {
    return (
      <Button
        onClick={handleAuth}
        variant="outline"
        className="w-full"
        style={{ borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-foreground)', background: 'transparent' }}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAuth}
        disabled={isLoggingIn}
        className="w-full"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Login with Internet Identity
          </>
        )}
      </Button>
      {isLoginError && (
        <div className="flex items-center gap-2 text-xs p-2 rounded-md" style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>Login failed. </span>
          <button onClick={handleAuth} className="underline font-medium">Try Again</button>
        </div>
      )}
    </div>
  );
}
