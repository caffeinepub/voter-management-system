import React from 'react';
import { useGetVoters } from '../hooks/useGetVoters';
import { Gender } from '../backend';
import { Users, UserCheck, UserX, User, RefreshCw, AlertCircle } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{title}</p>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: color, opacity: 0.15 }}
        />
      </div>
      <div className="flex items-end gap-2">
        <span
          className="w-10 h-10 rounded-lg flex items-center justify-center absolute"
          style={{ background: color, color: 'white', opacity: 0.9 }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-heading font-bold" style={{ color: 'var(--foreground)' }}>
          {value}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{title}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: voters, isLoading, isError, refetch } = useGetVoters();

  const total = voters?.length ?? 0;
  const male = voters?.filter(v => v.gender === Gender.male).length ?? 0;
  const female = voters?.filter(v => v.gender === Gender.female).length ?? 0;
  const other = voters?.filter(v => v.gender === Gender.other).length ?? 0;

  const stats = [
    { title: 'Total Voters', value: total, icon: <Users className="w-5 h-5" />, color: 'oklch(0.45 0.15 250)' },
    { title: 'Male Voters', value: male, icon: <User className="w-5 h-5" />, color: 'oklch(0.45 0.15 220)' },
    { title: 'Female Voters', value: female, icon: <UserCheck className="w-5 h-5" />, color: 'oklch(0.55 0.15 340)' },
    { title: 'Other', value: other, icon: <UserX className="w-5 h-5" />, color: 'oklch(0.55 0.15 145)' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--foreground)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Overview of voter registration statistics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)', borderColor: 'var(--destructive)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Failed to load voter data</p>
            <p className="text-sm opacity-80">Please try again</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            style={{ borderColor: 'var(--destructive-foreground)', color: 'var(--destructive-foreground)' }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Summary section */}
      {!isLoading && !isError && voters && voters.length > 0 && (
        <div
          className="p-6 rounded-xl border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="font-heading font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
            Gender Distribution
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Male', count: male, color: 'oklch(0.45 0.15 220)' },
              { label: 'Female', count: female, color: 'oklch(0.55 0.15 340)' },
              { label: 'Other', count: other, color: 'oklch(0.55 0.15 145)' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm w-16" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: total > 0 ? `${(item.count / total) * 100}%` : '0%',
                      background: item.color,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right" style={{ color: 'var(--foreground)' }}>
                  {total > 0 ? `${Math.round((item.count / total) * 100)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && (!voters || voters.length === 0) && (
        <div
          className="p-12 rounded-xl border text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <h3 className="font-heading font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
            No Voters Registered
          </h3>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Start by adding voters through the Voter Entry page.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs py-4" style={{ color: 'var(--muted-foreground)' }}>
        © {new Date().getFullYear()} VoterMS — Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary)' }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
