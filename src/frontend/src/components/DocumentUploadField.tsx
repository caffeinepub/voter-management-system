import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob } from '../backend';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadFieldProps {
  label: string;
  value: ExternalBlob[];
  onChange: (blobs: ExternalBlob[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUploadField({ label, value, onChange, disabled }: DocumentUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('application/pdf') && !file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
        toast.error(`${file.name}: Please select PDF or JPEG files only`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File size must be less than 10MB`);
        return;
      }
    }

    try {
      setIsUploading(true);
      const newBlobs: ExternalBlob[] = [];
      const newFileNames: string[] = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: percentage }));
        });

        newBlobs.push(externalBlob);
        newFileNames.push(file.name);
      }

      onChange([...value, ...newBlobs]);
      setFileNames([...fileNames, ...newFileNames]);
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newBlobs = value.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);
    onChange(newBlobs);
    setFileNames(newFileNames);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <ImageIcon className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
        <div className="space-y-4">
          {/* Upload Area */}
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
              id={`document-upload-${label}`}
              multiple
            />
            <label htmlFor={`document-upload-${label}`} className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Click to upload documents</p>
                  <p className="text-xs text-muted-foreground">PDF or JPEG, max 10MB per file</p>
                </div>
              </div>
            </label>
          </div>

          {/* Upload Progress */}
          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate">{fileName}</span>
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Files List */}
          {value.length > 0 && !isUploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Uploaded Documents ({value.length})
              </p>
              <div className="space-y-2">
                {value.map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(fileNames[index] || 'document')}
                      <span className="text-sm text-foreground truncate">
                        {fileNames[index] || `Document ${index + 1}`}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
