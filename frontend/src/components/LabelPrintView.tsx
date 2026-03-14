import React from 'react';
import { Voter } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Printer, X } from 'lucide-react';

interface LabelPrintViewProps {
  voters: Voter[];
  onClose: () => void;
}

function VoterLabel({ voter }: { voter: Voter }) {
  return (
    <div
      className="border rounded-lg p-3 text-xs space-y-1 print:border-gray-400"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{voter.name}</p>
      <p style={{ color: 'var(--muted-foreground)' }}>ID: {voter.voterId}</p>
      {voter.houseNumber !== undefined && (
        <p style={{ color: 'var(--foreground)' }}>H.No: {String(voter.houseNumber)}</p>
      )}
      {voter.address && <p style={{ color: 'var(--foreground)' }}>{voter.address}</p>}
      <p style={{ color: 'var(--foreground)' }}>
        {[voter.area, voter.taluka, voter.district].filter(Boolean).join(', ')}
      </p>
      <p style={{ color: 'var(--foreground)' }}>
        {[voter.state, voter.pincode].filter(Boolean).join(' - ')}
      </p>
      {voter.mobileNo && <p style={{ color: 'var(--muted-foreground)' }}>Mob: {voter.mobileNo}</p>}
    </div>
  );
}

export default function LabelPrintView({ voters, onClose }: LabelPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  // Group into pages of 10
  const pages: Voter[][] = [];
  for (let i = 0; i < voters.length; i += 10) {
    pages.push(voters.slice(i, i + 10));
  }

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#label-print-root) { display: none !important; }
          #label-print-root { display: block !important; }
          .no-print { display: none !important; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: avoid; }
        }
      `}</style>

      <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)' }}>
          <DialogHeader>
            <div className="flex items-center justify-between no-print">
              <DialogTitle className="font-heading flex items-center gap-2">
                <Printer className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                Print Labels ({voters.length} voters)
              </DialogTitle>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogHeader>

          <div id="label-print-root">
            {pages.map((page, pi) => (
              <div key={pi} className="print-page mb-6">
                <p className="text-xs mb-2 no-print" style={{ color: 'var(--muted-foreground)' }}>
                  Page {pi + 1} ({page.length} labels)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {page.map((voter) => (
                    <VoterLabel key={voter.voterId} voter={voter} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
