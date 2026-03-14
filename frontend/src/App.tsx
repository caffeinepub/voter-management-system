import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import LoginButton from './components/LoginButton';
import ProfileSetupModal from './components/ProfileSetupModal';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import AppLayout from './components/AppLayout';
import { Loader2 } from 'lucide-react';

function AuthGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // ── Phase 1: Initializing auth / actor ──────────────────────────────────────
  if (isInitializing || actorFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/voter-mgmt-logo.dim_128x128.png"
            alt="Logo"
            className="w-16 h-16 rounded-xl"
          />
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Initializing…</p>
        </div>
      </div>
    );
  }

  // ── Phase 2: Not logged in ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8 px-4">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/generated/voter-mgmt-logo.dim_128x128.png"
            alt="Logo"
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
          <h1 className="text-3xl font-bold text-primary tracking-tight">Voter Management</h1>
          <p className="text-muted-foreground text-center max-w-sm">
            Securely manage voter records, tasks, and analytics. Please log in to continue.
          </p>
        </div>
        <LoginButton />
        <footer className="absolute bottom-4 text-xs text-muted-foreground">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname || 'voter-management'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            caffeine.ai
          </a>{' '}
          © {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // ── Phase 3: Loading profile ─────────────────────────────────────────────────
  if (profileLoading || !profileFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Phase 4: First-time user — needs profile setup ───────────────────────────
  if (userProfile === null || userProfile === undefined) {
    return <ProfileSetupModal />;
  }

  // ── Phase 5: Role validation ─────────────────────────────────────────────────
  const validRoles = ['Admin', 'Supervisor', 'Karyakarta'];
  if (!validRoles.includes(userProfile.role)) {
    return <AccessDeniedScreen />;
  }

  // ── Phase 6: Full app ────────────────────────────────────────────────────────
  return <AppLayout userProfile={userProfile} />;
}

export default function App() {
  return <AuthGate />;
}
