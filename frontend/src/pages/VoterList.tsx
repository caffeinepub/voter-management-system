import React, { useState, useCallback } from 'react';
import { useGetVoters } from '../hooks/useGetVoters';
import { Voter } from '../backend';
import VoterTable from '../components/VoterTable';
import AdvancedSearchFilters from '../components/AdvancedSearchFilters';
import VoterImportDialog from '../components/VoterImportDialog';
import LabelPrintView from '../components/LabelPrintView';
import VoterDetailModal from '../components/VoterDetailModal';
import { exportVotersToExcel } from '../utils/excelExport';
import { Button } from '../components/ui/button';
import { Download, Upload, Tag, RefreshCw, AlertCircle } from 'lucide-react';
import { Page } from '../components/AppLayout';

interface FilterState {
  name: string;
  mobile: string;
  voterId: string;
  houseNumber: string;
  gender: string;
  caste: string;
  area: string;
  taluka: string;
  district: string;
  state: string;
}

interface VoterListProps {
  onNavigate?: (page: Page) => void;
}

export default function VoterList({ onNavigate: _onNavigate }: VoterListProps) {
  const { data: voters, isLoading, isError, refetch } = useGetVoters();
  const [filters, setFilters] = useState<FilterState>({
    name: '', mobile: '', voterId: '', houseNumber: '',
    gender: '', caste: '', area: '', taluka: '', district: '', state: '',
  });
  const [importOpen, setImportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

  const filteredVoters = useCallback(() => {
    if (!voters) return [];
    return voters.filter(v => {
      if (filters.name && !v.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.mobile && !(v.mobileNo?.toLowerCase().includes(filters.mobile.toLowerCase()))) return false;
      if (filters.voterId && !v.voterId.toLowerCase().includes(filters.voterId.toLowerCase())) return false;
      if (filters.houseNumber && String(v.houseNumber ?? '') !== filters.houseNumber) return false;
      if (filters.gender && v.gender !== filters.gender) return false;
      if (filters.caste && !(v.caste?.toLowerCase().includes(filters.caste.toLowerCase()))) return false;
      if (filters.area && v.area !== filters.area) return false;
      if (filters.taluka && v.taluka !== filters.taluka) return false;
      if (filters.district && v.district !== filters.district) return false;
      if (filters.state && v.state !== filters.state) return false;
      return true;
    });
  }, [voters, filters]);

  const displayed = filteredVoters();

  const handleExport = () => {
    exportVotersToExcel(displayed);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--foreground)' }}>
            Voter List
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {displayed.length} voter{displayed.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={displayed.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPrintOpen(true)} disabled={displayed.length === 0}>
            <Tag className="w-4 h-4 mr-2" />
            Print Labels
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)', borderColor: 'var(--destructive)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Failed to load voters</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Filters */}
      <AdvancedSearchFilters
        voters={voters ?? []}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Table */}
      <VoterTable
        voters={displayed}
        isLoading={isLoading}
        onRowClick={setSelectedVoter}
      />

      {/* Modals */}
      <VoterImportDialog
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          refetch();
        }}
      />

      {printOpen && (
        <LabelPrintView
          voters={displayed}
          onClose={() => setPrintOpen(false)}
        />
      )}

      {selectedVoter && (
        <VoterDetailModal
          voter={selectedVoter}
          onClose={() => setSelectedVoter(null)}
        />
      )}
    </div>
  );
}
