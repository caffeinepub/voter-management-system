import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useGetVoters } from '../hooks/useGetVoters';
import { useAddVoter } from '../hooks/useAddVoter';
import { parseExcelFile } from '../utils/excelImport';
import type { Voter } from '../backend';

interface VoterImportDialogProps {
  onClose: () => void;
}

export default function VoterImportDialog({ onClose }: VoterImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: existingVoters } = useGetVoters();
  const { mutateAsync: addVoter } = useAddVoter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        toast.error('Please select a valid CSV or Excel file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    try {
      const parsedVoters = await parseExcelFile(file);
      
      if (parsedVoters.length === 0) {
        toast.error('No valid voter data found in the file');
        setIsProcessing(false);
        return;
      }

      const existingVoterIds = new Set(existingVoters?.map(v => v.voterId.toString()) || []);
      const existingMobiles = new Set(existingVoters?.map(v => v.mobileNo) || []);

      for (let i = 0; i < parsedVoters.length; i++) {
        const voter = parsedVoters[i];
        
        // Check if voter already exists
        if (existingVoterIds.has(voter.voterId.toString()) || existingMobiles.has(voter.mobileNo)) {
          skipped++;
          setProgress(((i + 1) / parsedVoters.length) * 100);
          continue;
        }

        try {
          await addVoter(voter);
          imported++;
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message}`);
          skipped++;
        }

        setProgress(((i + 1) / parsedVoters.length) * 100);
      }

      setResult({ imported, skipped, errors });
      
      if (imported > 0) {
        toast.success(`Successfully imported ${imported} voter${imported !== 1 ? 's' : ''}`);
      }
      
      if (skipped > 0) {
        toast.info(`Skipped ${skipped} existing or invalid voter${skipped !== 1 ? 's' : ''}`);
      }
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
      errors.push(error.message);
      setResult({ imported, skipped, errors });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Voters from CSV/Excel
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import voter records. Only new voters will be added.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!result && (
            <>
              <div className="space-y-2">
                <Label htmlFor="file">Select CSV or Excel File</Label>
                <div className="flex gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isProcessing}
                  />
                  {file && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={isProcessing}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The file should contain columns for all voter fields.
                  CSV files exported from this system can be re-imported. Existing voters (matched by Voter ID or Mobile Number) will be skipped.
                </AlertDescription>
              </Alert>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!file || isProcessing}>
                  {isProcessing ? 'Importing...' : 'Import Voters'}
                </Button>
              </div>
            </>
          )}

          {result && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                      <p className="text-sm text-muted-foreground">Imported</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-yellow-50">
                    <XCircle className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                      <p className="text-sm text-muted-foreground">Skipped</p>
                    </div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Errors encountered:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {result.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>...and {result.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={onClose}>Close</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
