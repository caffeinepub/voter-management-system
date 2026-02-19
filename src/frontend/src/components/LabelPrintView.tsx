import { Voter } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface LabelPrintViewProps {
  voters: Voter[];
  onClose: () => void;
}

export default function LabelPrintView({ voters, onClose }: LabelPrintViewProps) {
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
  for (let i = 0; i < voters.length; i += votersPerPage) {
    pages.push(voters.slice(i, i + votersPerPage));
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto no-print">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Print Labels Preview</span>
              <div className="flex gap-2">
                <Button onClick={handlePrint} size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={onClose} size="sm" variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {voters.length} label{voters.length !== 1 ? 's' : ''} • {pages.length} page{pages.length !== 1 ? 's' : ''}
            </p>
            <div className="print-container">
              {pages.map((pageVoters, pageIndex) => (
                <div key={pageIndex} className="print-page">
                  <div className="label-grid">
                    {pageVoters.map(renderLabel)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
