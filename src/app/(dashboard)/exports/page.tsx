'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Download, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { NoExportsEmpty } from '@/components/shared/EmptyStates';
import { PageLoader } from '@/components/shared/LoadingStates';

const STATUS_CONFIG = {
  PENDING:    { icon: Clock,         class: 'text-yellow-500', label: 'Pending' },
  PROCESSING: { icon: Loader2,       class: 'text-blue-500 animate-spin', label: 'Processing' },
  READY:      { icon: CheckCircle2,  class: 'text-green-500', label: 'Ready' },
  EXPIRED:    { icon: AlertCircle,   class: 'text-muted-foreground', label: 'Expired' },
};

interface ExportRecord {
  id: string;
  name: string;
  platform: string;
  format: string;
  status: keyof typeof STATUS_CONFIG;
  fileUrl: string | null;
  generationIds: string[];
  createdAt: string;
  campaign?: { name: string } | null;
}

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/exports')
      .then((r) => r.json())
      .then((data) => {
        setExports(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
        <p className="text-muted-foreground mt-1">
          Download your platform-ready creative packages.
        </p>
      </div>

      {exports.length === 0 ? (
        <NoExportsEmpty />
      ) : (
        <div className="space-y-3">
          {exports.map((exp) => {
            const { icon: StatusIcon, class: statusClass, label: statusLabel } =
              STATUS_CONFIG[exp.status] ?? STATUS_CONFIG.PENDING;

            return (
              <Card key={exp.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{exp.name}</p>
                      {exp.campaign && (
                        <Badge variant="outline" className="text-[10px]">{exp.campaign.name}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="capitalize">{exp.platform.replace(',', ', ')}</span>
                      <span>·</span>
                      <span>{exp.generationIds.length} items</span>
                      <span>·</span>
                      <span>{format(new Date(exp.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={cn('flex items-center gap-1.5 text-xs font-medium', statusClass)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusLabel}
                    </div>

                    {exp.status === 'READY' && exp.fileUrl && (
                      <Button asChild size="sm" variant="secondary" className="gap-1.5 h-8 text-xs">
                        <a href={`/api/export/download/${exp.id}`} download>
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
