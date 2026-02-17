'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AssetUploaderProps {
    brandId: string;
    onUploadComplete?: () => void;
}

export function AssetUploader({ brandId, onUploadComplete }: AssetUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        },
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        try {
            const response = await fetch(`/api/brands/${brandId}/assets`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            toast.success('Assets uploaded successfully');
            setFiles([]);
            if (onUploadComplete) onUploadComplete();
        } catch (error) {
            toast.error('Failed to upload assets');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
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
                            <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50 border">
                                <div className="flex items-center gap-2 truncate">
                                    {file.type.includes('pdf') ? (
                                        <FileText className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4 text-blue-500" />
                                    )}
                                    <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-[10px] text-muted-foreground text-nowrap">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
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
