'use client';

import { FileText, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: { name: string; url?: string; mimeType?: string; sizeBytes?: number };
  onRemove?: () => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  const isPdf = file.mimeType?.includes('pdf') || file.name.endsWith('.pdf');
  const isImage = file.mimeType?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name);

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border bg-muted/30 p-3', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background border">
        {isImage && file.url ? (
          <img src={file.url} alt={file.name} className="h-full w-full rounded-md object-cover" />
        ) : isPdf ? (
          <FileText className="h-5 w-5 text-red-500" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        {file.sizeBytes !== undefined && (
          <p className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</p>
        )}
      </div>
      {onRemove && (
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
