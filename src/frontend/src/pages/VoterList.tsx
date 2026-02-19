import { useState } from 'react';
import { useGetVoters } from '../hooks/useGetVoters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, Users, Printer } from 'lucide-react';
import VoterTable from '../components/VoterTable';
import AdvancedSearchFilters from '../components/AdvancedSearchFilters';
import LabelPrintView from '../components/LabelPrintView';
import VoterImportDialog from '../components/VoterImportDialog';
import { exportVotersToExcel } from '../utils/excelExport';
import type { Voter } from '../backend';

export default function VoterList() {
  const { data: voters, isLoading, error, refetch } = useGetVoters();
  const [filteredVoters, setFilteredVoters] = useState<Voter[]>([]);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExport = () => {
    if (filteredVoters.length > 0) {
      exportVotersToExcel(filteredVoters);
    }
  };

  const handleImportClose = () => {
    setShowImportDialog(false);
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Voter List</h1>
            <p className="text-muted-foreground mt-1">View and manage all registered voters</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load voters: {error.message}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Voter List</h1>
            <p className="text-muted-foreground mt-1">View and manage all registered voters</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || !filteredVoters || filteredVoters.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowPrintView(true)}
            disabled={isLoading || !filteredVoters || filteredVoters.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Labels
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : voters && voters.length > 0 ? (
        <>
          <AdvancedSearchFilters
            voters={voters}
            onFilteredVotersChange={setFilteredVoters}
          />

          <Card>
            <CardHeader>
              <CardTitle>All Voters</CardTitle>
              <CardDescription>
                Showing {filteredVoters.length} of {voters.length} voter{voters.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoterTable voters={filteredVoters} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No voters found</p>
              <p className="text-sm mt-2">Start by adding your first voter or importing from CSV</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showPrintView && filteredVoters && filteredVoters.length > 0 && (
        <LabelPrintView
          voters={filteredVoters}
          onClose={() => setShowPrintView(false)}
        />
      )}

      {showImportDialog && (
        <VoterImportDialog
          onClose={handleImportClose}
        />
      )}
    </div>
  );
}
