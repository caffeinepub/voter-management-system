import React, { useState, useRef } from 'react';
import { useAddVoter } from '../hooks/useAddVoter';
import { parseExcelFile } from '../utils/excelImport';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface VoterImportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ImportResult {
  success: number;
  skipped: number;
  errors: string[];
}

export default function VoterImportDialog({ open, onClose }: VoterImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: addVoter } = useAddVoter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress(0);

    try {
      const parsed = await parseExcelFile(file);

      const res: ImportResult = { success: 0, skipped: 0, errors: [] };

      for (let i = 0; i < parsed.length; i++) {
        const voter = parsed[i];
        try {
          await addVoter({
            name: voter.name,
            voterId: voter.voterId,
            fatherHusbandName: voter.fatherHusbandName,
            houseNumber: voter.houseNumber,
            address: voter.address,
            gender: voter.gender === 'male' ? 'male' : voter.gender === 'female' ? 'female' : 'other',
            area: voter.area,
            taluka: voter.taluka,
            district: voter.district,
            state: voter.state,
            pincode: voter.pincode,
            mobileNo: voter.mobileNo,
            dob: voter.dob,
            caste: voter.caste,
            education: voter.education,
            profession: voter.profession,
            office: voter.office,
            politicalIdeology: voter.politicalIdeology,
            comments: voter.comments,
            photo: null,
            signature: null,
            educationalDocuments: [],
          });
          res.success++;
        } catch (err: unknown) {
          const msg = (err as Error).message ?? '';
          if (msg.includes('already exists')) {
            res.skipped++;
          } else {
            res.errors.push(`Row ${i + 2}: ${msg}`);
          }
        }
        setProgress(Math.round(((i + 1) / parsed.length) * 100));
      }

      setResult(res);
    } catch (err: unknown) {
      setResult({ success: 0, skipped: 0, errors: [(err as Error).message ?? 'Failed to parse file'] });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent style={{ background: 'var(--card)' }}>
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Upload className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Import Voters from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload area */}
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-accent/30 transition-colors"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{file.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Click to select a CSV file
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Required columns: Name, Voter ID
                </p>
              </div>
            )}
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <span style={{ color: 'var(--foreground)' }}>{result.success} voters imported successfully</span>
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                  <span style={{ color: 'var(--foreground)' }}>{result.skipped} voters skipped (duplicate IDs)</span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                    <span style={{ color: 'var(--foreground)' }}>{result.errors.length} errors</span>
                  </div>
                  <div
                    className="max-h-24 overflow-y-auto p-2 rounded text-xs space-y-1"
                    style={{ background: 'var(--muted)' }}
                  >
                    {result.errors.map((e, i) => (
                      <p key={i} style={{ color: 'var(--destructive)' }}>{e}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
