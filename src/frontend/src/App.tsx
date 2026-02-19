import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, Link, useLocation } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
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
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const queryClient = new QueryClient();

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
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
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
