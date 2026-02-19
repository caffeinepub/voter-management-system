import { useGetVoters } from '../hooks/useGetVoters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Printer, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Voter } from '../backend';

export default function LabelPrinting() {
  const { data: voters, isLoading, error } = useGetVoters();

  const handlePrint = () => {
    window.print();
  };

  const renderLabel = (voter: Voter) => (
    <div key={voter.srNo.toString()} className="label-item border border-gray-300 p-3 rounded-md bg-white">
      <div className="text-sm space-y-1">
        <p className="font-bold text-base">{voter.name}</p>
        <p className="text-xs text-gray-600">House No: {voter.houseNumber?.toString() || 'N/A'}</p>
        <p className="text-xs">{voter.area || 'N/A'}</p>
        <p className="text-xs">{voter.taluka || 'N/A'}, {voter.district || 'N/A'}</p>
        <p className="text-xs">{voter.state || 'N/A'} - {voter.pincode || 'N/A'}</p>
      </div>
    </div>
  );

  // Split voters into pages of 10
  const votersPerPage = 10;
  const pages: Voter[][] = [];
  if (voters) {
    for (let i = 0; i < voters.length; i += votersPerPage) {
      pages.push(voters.slice(i, i + votersPerPage));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Printer className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Label Printing</h1>
            <p className="text-muted-foreground mt-1">Print voter labels for A4 paper</p>
          </div>
        </div>
        <Button onClick={handlePrint} disabled={!voters || voters.length === 0}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="no-print">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load voters: {error.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : voters && voters.length > 0 ? (
        <>
          <Card className="no-print">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {voters.length} label{voters.length !== 1 ? 's' : ''} • {pages.length} page{pages.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Print-friendly layout */}
          <div className="print-container">
            {pages.map((pageVoters, pageIndex) => (
              <div key={pageIndex} className="print-page">
                <div className="label-grid">
                  {pageVoters.map(renderLabel)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No voters found</p>
              <p className="text-sm mt-2">Add voters to print labels</p>
            </div>
          </CardContent>
        </Card>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .label-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8mm;
          }
          .label-item {
            height: 50mm;
            display: flex;
            align-items: center;
            padding: 5mm;
          }
        }
        @media screen {
          .print-container {
            background: #f5f5f5;
            padding: 20px;
          }
          .print-page {
            background: white;
            margin: 0 auto 20px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .label-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .label-item {
            min-height: 100px;
          }
        }
      `}</style>
    </div>
  );
}
