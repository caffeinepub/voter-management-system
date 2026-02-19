import { useGetVoters } from '../hooks/useGetVoters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BarChart3 } from 'lucide-react';
import DistributionChart from '../components/DistributionChart';

export default function Analytics() {
  const { data: voters, isLoading, error } = useGetVoters();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>Loading voter statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load voter data: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!voters || voters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>No voter data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No voters found</p>
            <p className="text-sm mt-2">Add voters to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to convert Record<string, number> to ChartData[]
  const convertToChartData = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    return Object.entries(data).map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
    }));
  };

  // Process data for charts
  const genderData = voters.reduce((acc: Record<string, number>, voter) => {
    if (!voter.gender) return acc;
    const gender = voter.gender.charAt(0).toUpperCase() + voter.gender.slice(1);
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const casteData = voters.reduce((acc: Record<string, number>, voter) => {
    if (!voter.caste) return acc;
    const caste = voter.caste;
    acc[caste] = (acc[caste] || 0) + 1;
    return acc;
  }, {});

  const educationData = voters.reduce((acc: Record<string, number>, voter) => {
    if (!voter.education) return acc;
    const education = voter.education;
    acc[education] = (acc[education] || 0) + 1;
    return acc;
  }, {});

  const officeData = voters.reduce((acc: Record<string, number>, voter) => {
    if (!voter.office) return acc;
    const office = voter.office;
    acc[office] = (acc[office] || 0) + 1;
    return acc;
  }, {});

  const areaData = voters.reduce((acc: Record<string, number>, voter) => {
    if (!voter.area) return acc;
    const area = voter.area;
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Voter distribution and statistics</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DistributionChart
          title="Gender Distribution"
          data={convertToChartData(genderData)}
          type="pie"
        />

        <DistributionChart
          title="Caste Distribution"
          data={convertToChartData(casteData)}
          type="bar"
        />

        <DistributionChart
          title="Education Distribution"
          data={convertToChartData(educationData)}
          type="bar"
        />

        <DistributionChart
          title="Office Distribution"
          data={convertToChartData(officeData)}
          type="bar"
        />

        <DistributionChart
          title="Area Distribution"
          data={convertToChartData(areaData)}
          type="bar"
        />
      </div>
    </div>
  );
}
