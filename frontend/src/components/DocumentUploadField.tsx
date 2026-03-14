import React, { useRef, useState } from 'react';
import { ExternalBlob } from '../backend';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { FileText, X, Upload } from 'lucide-react';

interface DocumentUploadFieldProps {
  label: string;
  values: ExternalBlob[];
  onChange: (blobs: ExternalBlob[]) => void;
}

interface FileEntry {
  name: string;
  blob: ExternalBlob;
  progress: number;
}

export default function DocumentUploadField({ label, values, onChange }: DocumentUploadFieldProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setError(null);
    const newEntries: FileEntry[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.includes('pdf') && !file.type.includes('jpeg') && !file.type.includes('jpg') && !file.type.includes('png')) {
        setError('Only PDF and JPEG/PNG files are accepted');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each file must be under 10MB');
        continue;
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const entry: FileEntry = {
        name: file.name,
        blob: ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setEntries(prev => prev.map(e => e.name === file.name ? { ...e, progress: pct } : e));
        }),
        progress: 0,
      };
      newEntries.push(entry);
    }

    const updated = [...entries, ...newEntries];
    setEntries(updated);
    onChange([...values, ...newEntries.map(e => e.blob)]);
  };

  const handleRemove = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    onChange(updated.map(e => e.blob));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div
        className="border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-accent/30 transition-colors"
        style={{ borderColor: error ? 'var(--destructive)' : 'var(--border)' }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/jpeg,image/jpg,image/png"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
          <div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Click to upload documents
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              PDF, JPEG, PNG — max 10MB each
            </p>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-lg border"
              style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
            >
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{entry.name}</p>
                {entry.progress > 0 && entry.progress < 100 && (
                  <Progress value={entry.progress} className="h-1 mt-1" />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="p-1 rounded"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{error}</p>}
    </div>
  );
}
