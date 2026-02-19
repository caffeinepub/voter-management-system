import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function AccessDeniedScreen() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource. Please contact your administrator if you believe this is
            an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {identity && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">Principal ID:</p>
              <p className="font-mono text-xs break-all mt-1">{identity.getPrincipal().toString()}</p>
            </div>
          )}
          <Button onClick={handleLogout} variant="outline" className="w-full gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
