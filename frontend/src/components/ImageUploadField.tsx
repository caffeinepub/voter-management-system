import React, { useRef, useState } from 'react';
import { ExternalBlob } from '../backend';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Image } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: ExternalBlob | null;
  onChange: (blob: ExternalBlob | null) => void;
}

export default function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.includes('jpeg') && !file.type.includes('jpg') && !file.type.includes('png')) {
      setError('Only JPEG/PNG files are accepted');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setProgress(0);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setProgress(pct));
    onChange(blob);
    setUploading(false);
    setProgress(100);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-accent/30 transition-colors relative"
        style={{ borderColor: error ? 'var(--destructive)' : 'var(--border)' }}
        onClick={() => !value && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {preview || value ? (
          <div className="relative">
            <img
              src={preview ?? value?.getDirectURL()}
              alt={label}
              className="w-full h-32 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute top-1 right-1 p-1 rounded-full"
              style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <Image className="w-8 h-8 mx-auto" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Click to upload {label}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              JPEG/PNG, max 5MB
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1" />
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Uploading... {progress}%</p>
        </div>
      )}

      {error && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{error}</p>}
    </div>
  );
}
