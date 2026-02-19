import { useGetVoters } from '../hooks/useGetVoters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Gender } from '../backend';

export default function Dashboard() {
  const { data: voters, isLoading, error, refetch, isFetching } = useGetVoters();

  // Loading state - show while fetching data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of voter statistics</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state - show error with retry option
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of voter statistics</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load voter data: {error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate statistics
  const totalVoters = voters?.length || 0;
  const maleVoters = voters?.filter((v) => v.gender === Gender.male).length || 0;
  const femaleVoters = voters?.filter((v) => v.gender === Gender.female).length || 0;
  const otherVoters = voters?.filter((v) => v.gender === Gender.other).length || 0;

  const stats = [
    {
      title: 'Total Voters',
      value: totalVoters,
      description: 'Registered in the system',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Male Voters',
      value: maleVoters,
      description: `${totalVoters > 0 ? ((maleVoters / totalVoters) * 100).toFixed(1) : 0}% of total`,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Female Voters',
      value: femaleVoters,
      description: `${totalVoters > 0 ? ((femaleVoters / totalVoters) * 100).toFixed(1) : 0}% of total`,
      icon: UserCheck,
      color: 'bg-purple-500',
    },
    {
      title: 'Other',
      value: otherVoters,
      description: `${totalVoters > 0 ? ((otherVoters / totalVoters) * 100).toFixed(1) : 0}% of total`,
      icon: UserX,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of voter statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalVoters === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-center">No Voters Yet</CardTitle>
            <CardDescription className="text-center">
              Start by adding voters to see statistics and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
