import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import { useActor } from './hooks/useActor';
import LoginButton from './components/LoginButton';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import VoterEntry from './pages/VoterEntry';
import VoterList from './pages/VoterList';
import LabelPrinting from './pages/LabelPrinting';
import TaskManagement from './pages/TaskManagement';
import Analytics from './pages/Analytics';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Menu, Users, UserPlus, LayoutDashboard, Printer, ClipboardList, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

type Page = 'dashboard' | 'voter-entry' | 'voter-list' | 'label-printing' | 'task-management' | 'analytics';

const PROFILE_LOADING_TIMEOUT_MS = 30000; // 30 seconds

export default function App() {
  const { identity, isInitializing, loginStatus, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError, error, refetch } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const queryClient = useQueryClient();
  const loadingStartTimeRef = useRef<number | null>(null);
  const autoLogoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!identity;

  // Log identity obtained
  useEffect(() => {
    if (identity) {
      console.log(`[${new Date().toISOString()}] Identity obtained`);
    }
  }, [identity]);

  // Log actor initialization state
  useEffect(() => {
    if (isAuthenticated && actorFetching) {
      console.log(`[${new Date().toISOString()}] Waiting for actor initialization`);
    }
  }, [isAuthenticated, actorFetching]);

  // Log profile fetch state
  useEffect(() => {
    if (isAuthenticated && !actorFetching && profileLoading) {
      console.log(`[${new Date().toISOString()}] Waiting for profile fetch`);
    }
  }, [isAuthenticated, actorFetching, profileLoading]);

  // Log authentication flow complete
  useEffect(() => {
    if (isAuthenticated && !actorFetching && !profileLoading && isFetched) {
      console.log(`[${new Date().toISOString()}] Authentication flow complete`, {
        hasProfile: userProfile !== null,
      });
    }
  }, [isAuthenticated, actorFetching, profileLoading, isFetched, userProfile]);

  // Log all authentication states for debugging
  useEffect(() => {
    console.log('[App] Authentication State:', {
      isInitializing,
      isAuthenticated,
      loginStatus,
      hasActor: !!actor,
      actorFetching,
      profileLoading,
      isFetched,
      isError,
      userProfile,
      error: error?.message,
    });
  }, [isInitializing, isAuthenticated, loginStatus, actor, actorFetching, profileLoading, isFetched, isError, userProfile, error]);

  // Track loading time and show retry button after timeout
  useEffect(() => {
    if (isAuthenticated && profileLoading) {
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
      }

      const checkTimeout = setInterval(() => {
        if (loadingStartTimeRef.current) {
          const elapsed = Date.now() - loadingStartTimeRef.current;
          if (elapsed > PROFILE_LOADING_TIMEOUT_MS) {
            setShowRetryButton(true);
          }
        }
      }, 1000);

      return () => clearInterval(checkTimeout);
    } else {
      loadingStartTimeRef.current = null;
      setShowRetryButton(false);
    }
  }, [isAuthenticated, profileLoading]);

  // Automatic logout after 30 seconds of stuck loading
  useEffect(() => {
    if (isAuthenticated && profileLoading) {
      autoLogoutTimerRef.current = setTimeout(async () => {
        console.log(`[${new Date().toISOString()}] Automatic logout triggered due to 30-second timeout`);
        
        // Clear all state
        await clear();
        queryClient.clear();
        
        // Show message to user
        toast.error('Login timed out. Please try again.');
      }, PROFILE_LOADING_TIMEOUT_MS);
    } else {
      if (autoLogoutTimerRef.current) {
        clearTimeout(autoLogoutTimerRef.current);
        autoLogoutTimerRef.current = null;
      }
    }

    return () => {
      if (autoLogoutTimerRef.current) {
        clearTimeout(autoLogoutTimerRef.current);
      }
    };
  }, [isAuthenticated, profileLoading, clear, queryClient]);

  const handleManualRetry = async () => {
    console.log(`[${new Date().toISOString()}] User initiated manual retry`);
    setIsRetrying(true);
    
    try {
      // Clear all React Query cache
      queryClient.clear();
      
      // Invalidate actor query to force re-initialization
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      
      // Wait a moment for invalidation to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch profile
      await refetch();
      
      setShowRetryButton(false);
      loadingStartTimeRef.current = null;
    } catch (error: any) {
      console.error('Manual retry failed:', error);
      toast.error('Retry failed. Please try logging out and back in.');
    } finally {
      setIsRetrying(false);
    }
  };

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null && !isError;

  // Show loading state during initialization
  if (isInitializing) {
    console.log('[App] Rendering: Initializing state');
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    console.log('[App] Rendering: Login screen');
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Voter Management System</h1>
              <p className="text-muted-foreground text-lg">
                Secure, role-based election data management platform
              </p>
            </div>
            <div className="pt-8">
              <LoginButton />
            </div>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show error state if profile fetch failed
  if (isAuthenticated && isError && isFetched) {
    console.log('[App] Rendering: Error state');
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <div className="max-w-md w-full space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Loading Failed</AlertTitle>
              <AlertDescription>
                {error?.message || 'Unable to load your profile. Please try again.'}
              </AlertDescription>
            </Alert>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetch()} variant="default">
                Try Again
              </Button>
              <LoginButton />
            </div>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup modal if needed
  if (showProfileSetup) {
    console.log('[App] Rendering: Profile setup modal');
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ProfileSetupModal />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show loading while actor is initializing or profile is being fetched
  if (actorFetching || profileLoading || !isFetched) {
    console.log('[App] Rendering: Loading state');
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">
              {actorFetching ? 'Initializing connection...' : 'Loading profile...'}
            </p>
            <p className="text-xs text-muted-foreground">
              {!actor ? 'Waiting for actor...' : 'Fetching profile data...'}
            </p>
            
            {showRetryButton && (
              <div className="pt-4">
                <Button
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                  variant="default"
                  className="gap-2"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Retry Connection
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Connection is taking longer than expected
                </p>
              </div>
            )}
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  console.log('[App] Rendering: Main application');

  const navigationItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'voter-entry' as Page, label: 'Add Voter', icon: UserPlus },
    { id: 'voter-list' as Page, label: 'Voter List', icon: Users },
    { id: 'label-printing' as Page, label: 'Label Printing', icon: Printer },
    { id: 'task-management' as Page, label: 'Task Management', icon: ClipboardList },
    { id: 'analytics' as Page, label: 'Analytics', icon: BarChart3 },
  ];

  const NavigationContent = () => (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              setCurrentPage(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header style={{ backgroundColor: '#002080' }} className="border-b border-border shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-6 bg-white">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#002080' }}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-sm">Voter Management</h2>
                          <p className="text-xs text-muted-foreground">System</p>
                        </div>
                      </div>
                      <NavigationContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm sm:text-base md:text-lg font-bold text-white">Voter Management System</h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {userProfile && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold" style={{ color: '#002080' }}>
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-white">{userProfile.name}</p>
                      <p className="text-xs text-white/80">{userProfile.role}</p>
                    </div>
                  </div>
                )}
                <LoginButton />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm sticky top-24">
                <NavigationContent />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'voter-entry' && <VoterEntry />}
              {currentPage === 'voter-list' && <VoterList />}
              {currentPage === 'label-printing' && <LabelPrinting />}
              {currentPage === 'task-management' && <TaskManagement />}
              {currentPage === 'analytics' && <Analytics />}
            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-border mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} Voter Management System. Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'voter-management'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-medium"
                  style={{ color: '#002080' }}
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
