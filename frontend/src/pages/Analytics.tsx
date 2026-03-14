import React from 'react';
import { useGetVoters } from '../hooks/useGetVoters';
import { Gender } from '../backend';
import DistributionChart, { DistributionChartData } from '../components/DistributionChart';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { BarChart3, RefreshCw, AlertCircle } from 'lucide-react';

function computeDistribution(values: (string | undefined | null)[]): DistributionChartData[] {
  const counts: Record<string, number> = {};
  values.forEach(v => {
    if (v) {
      counts[v] = (counts[v] ?? 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function Analytics() {
  const { data: voters, isLoading, isError, refetch } = useGetVoters();

  const genderData: DistributionChartData[] = voters
    ? [
        { label: 'Male', count: voters.filter(v => v.gender === Gender.male).length },
        { label: 'Female', count: voters.filter(v => v.gender === Gender.female).length },
        { label: 'Other', count: voters.filter(v => v.gender === Gender.other).length },
      ].filter(d => d.count > 0)
    : [];

  const casteData = voters ? computeDistribution(voters.map(v => v.caste)) : [];
  const educationData = voters ? computeDistribution(voters.map(v => v.education)) : [];
  const officeData = voters ? computeDistribution(voters.map(v => v.office)) : [];
  const areaData = voters ? computeDistribution(voters.map(v => v.area)) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-heading font-bold text-2xl flex items-center gap-2"
            style={{ color: 'var(--foreground)' }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Voter data distribution and insights
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
        >
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">Failed to load analytics data</div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistributionChart title="Gender Distribution" data={genderData} chartType="pie" />
          <DistributionChart title="Caste Distribution" data={casteData} chartType="bar" />
          <DistributionChart title="Education Distribution" data={educationData} chartType="bar" />
          <DistributionChart title="Office Distribution" data={officeData} chartType="bar" />
          <DistributionChart title="Area Distribution" data={areaData} chartType="bar" />
        </div>
      )}
    </div>
  );
}
