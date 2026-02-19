import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob } from '../backend';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  label: string;
  value: ExternalBlob | null;
  onChange: (blob: ExternalBlob | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUploadField({ label, value, onChange, disabled }: ImageUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
      toast.error('Please select a JPEG image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create preview URL
      const blob = new Blob([bytes], { type: file.type });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Create ExternalBlob with progress tracking
      const externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      onChange(externalBlob);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
        {!value && !isUploading && (
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg"
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
              id={`image-upload-${label}`}
            />
            <label htmlFor={`image-upload-${label}`} className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground">JPEG only, max 5MB</p>
                </div>
              </div>
            </label>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
          </div>
        )}

        {value && previewUrl && !isUploading && (
          <div className="space-y-3">
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img src={previewUrl} alt={label} className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Image uploaded</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
