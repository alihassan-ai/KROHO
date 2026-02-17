'use client';

import { useRef, useState } from 'react';
import { Upload, X, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AssetUploaderProps {
    brandId: string;
    onUploadComplete?: () => void;
}

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp';

export function AssetUploader({ brandId, onUploadComplete }: AssetUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const valid = Array.from(incoming).filter((f) =>
            /\.(pdf|png|jpe?g|webp)$/i.test(f.name)
        );
        setFiles((prev) => [...prev, ...valid]);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));

        try {
            const res = await fetch(`/api/brands/${brandId}/assets`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            toast.success('Assets uploaded successfully');
            setFiles([]);
            onUploadComplete?.();
        } catch {
            toast.error('Failed to upload assets');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Hidden native file input — most reliable way to open file picker */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
                onClick={(e) => ((e.target as HTMLInputElement).value = '')}
            />

            {/* Drop zone */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    addFiles(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors select-none ${
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/20 hover:border-primary/50'
                }`}
            >
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary">
                        <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Click or drag and drop files</p>
                    <p className="text-xs text-muted-foreground">PDFs, PNG, JPG (Max 10MB)</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded bg-muted/50 border"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {file.type.includes('pdf') ? (
                                        <FileText className="h-4 w-4 shrink-0 text-red-500" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                                    )}
                                    <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFiles((prev) => prev.filter((_, i) => i !== index));
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                            Clear All
                        </Button>
                        <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
