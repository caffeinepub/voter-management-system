import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, Link, useLocation } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import { useActor } from './hooks/useActor';
import LoginButton from './components/LoginButton';
import ProfileSetupModal from './components/ProfileSetupModal';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import Dashboard from './pages/Dashboard';
import VoterEntry from './pages/VoterEntry';
import VoterList from './pages/VoterList';
import LabelPrinting from './pages/LabelPrinting';
import TaskManagement from './pages/TaskManagement';
import Analytics from './pages/Analytics';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Menu, X, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/voter-entry', label: 'Add Voter' },
    { path: '/voter-list', label: 'Voter List' },
    { path: '/label-printing', label: 'Label Printing' },
    { path: '/task-management', label: 'Task Management' },
    { path: '/analytics', label: 'Analytics' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[#002080] text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm sm:text-base md:text-lg font-bold">Voter Management System</h1>
            <div className="flex items-center gap-4">
              <LoginButton />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white hover:bg-white/10 p-2 rounded"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex mt-4 space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-white text-[#002080] font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive(item.path)
                      ? 'bg-white text-[#002080] font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-muted border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Voter Management System. Built with ❤️ using{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function AppContent() {
  const { identity, isInitializing, clear, login } = useInternetIdentity();
  const actorResult = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError } = useGetCallerUserProfile();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('initializing');

  const isAuthenticated = !!identity;
  const actor = actorResult.actor;
  const actorFetching = actorResult.isFetching;
  const actorIsError = (actorResult as any).isError || false;

  // Track authentication flow stages with detailed logging
  useEffect(() => {
    const timestamp = new Date().toISOString();
    
    if (isInitializing) {
      setCurrentStage('initializing');
      console.log(`[${timestamp}] [App] Stage: Initializing Internet Identity`);
    } else if (!isAuthenticated) {
      setCurrentStage('not_authenticated');
      console.log(`[${timestamp}] [App] Stage: Not authenticated`);
    } else if (actorFetching) {
      setCurrentStage('initializing_actor');
      console.log(`[${timestamp}] [App] Stage: Initializing actor`, { actorAvailable: !!actor });
    } else if (actorIsError) {
      setCurrentStage('actor_error');
      console.log(`[${timestamp}] [App] Stage: Actor initialization error`);
    } else if (!actor) {
      setCurrentStage('waiting_for_actor');
      console.log(`[${timestamp}] [App] Stage: Waiting for actor`);
    } else if (profileLoading && !isFetched) {
      setCurrentStage('loading_profile');
      console.log(`[${timestamp}] [App] Stage: Loading profile`);
    } else if (isFetched && userProfile === null) {
      setCurrentStage('profile_setup');
      console.log(`[${timestamp}] [App] Stage: Profile setup required`);
    } else if (userProfile) {
      setCurrentStage('authenticated');
      console.log(`[${timestamp}] [App] Stage: Authenticated and ready`, { 
        userName: userProfile.name,
        userRole: userProfile.role 
      });
    }
  }, [isInitializing, isAuthenticated, actorFetching, actorIsError, actor, profileLoading, isFetched, userProfile]);

  // 30-second timeout for authentication flow
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthTimeout(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!actor || profileLoading || (!isFetched && !userProfile)) {
        console.error(`[${new Date().toISOString()}] [App] Authentication timeout after 30 seconds`, {
          actorAvailable: !!actor,
          actorFetching,
          actorIsError,
          profileLoading,
          isFetched,
          userProfile: !!userProfile,
          currentStage
        });
        setAuthTimeout(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, actor, actorFetching, actorIsError, profileLoading, isFetched, userProfile, currentStage]);

  // Handle authentication timeout
  const handleRetryAuth = async () => {
    console.log(`[${new Date().toISOString()}] [App] Retrying authentication flow`);
    setAuthTimeout(false);
    await clear();
    queryClient.clear();
    setTimeout(() => {
      login();
    }, 500);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Internet Identity...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-foreground">Welcome to Voter Management System</h2>
          <p className="text-muted-foreground">Please log in to access the application</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  // Show timeout error with retry button
  if (authTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Timeout</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>The authentication process took too long to complete. This might be due to network issues or server problems.</p>
            <p className="text-sm">Current stage: {currentStage}</p>
            <Button onClick={handleRetryAuth} variant="outline" className="w-full mt-4">
              Retry Authentication
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show actor initialization error
  if (actorIsError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>Failed to establish connection with the backend. Please try again.</p>
            <Button onClick={handleRetryAuth} variant="outline" className="w-full mt-4">
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading while actor is initializing
  if (actorFetching || !actor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing connection...</p>
          <p className="text-xs text-muted-foreground mt-2">Stage: {currentStage}</p>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched for the first time
  if (profileLoading && !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show profile error
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>Failed to load your profile. Please try logging in again.</p>
            <Button onClick={handleRetryAuth} variant="outline" className="w-full mt-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show profile setup modal if user is authenticated but has no profile
  const showProfileSetup = isAuthenticated && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // If profile hasn't loaded yet but we're past the initial fetch, show loading
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  const userRole = userProfile.role;

  if (userRole !== 'Admin' && userRole !== 'Supervisor' && userRole !== 'Karyakarta') {
    return <AccessDeniedScreen />;
  }

  const rootRoute = createRootRoute({
    component: Layout,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Dashboard,
  });

  const voterEntryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/voter-entry',
    component: VoterEntry,
  });

  const voterListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/voter-list',
    component: VoterList,
  });

  const labelPrintingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/label-printing',
    component: LabelPrinting,
  });

  const taskManagementRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/task-management',
    component: TaskManagement,
  });

  const analyticsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/analytics',
    component: Analytics,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    voterEntryRoute,
    voterListRoute,
    labelPrintingRoute,
    taskManagementRoute,
    analyticsRoute,
  ]);

  const router = createRouter({ routeTree });

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
