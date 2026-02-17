'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Package, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { FormatSelector } from './FormatSelector';
import { PlatformPreview } from './PlatformPreview';
import type { Generation } from '@/types/generation';

interface ExportBuilderProps {
  generations: Generation[];
  campaignId?: string;
  campaignName?: string;
}

export function ExportBuilder({ generations, campaignId, campaignName }: ExportBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    generations.filter((g) => g.status === 'COMPLETED').map((g) => g.id)
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['meta']);
  const [isExporting, setIsExporting] = useState(false);

  const completed = generations.filter((g) => g.status === 'COMPLETED');

  const toggleId = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const togglePlatform = (p: string) =>
    setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  const selectAll = () => setSelectedIds(completed.map((g) => g.id));
  const deselectAll = () => setSelectedIds([]);

  const handleExport = async () => {
    if (!selectedIds.length) { toast.error('Select at least one generation'); return; }
    if (!selectedPlatforms.length) { toast.error('Select at least one platform'); return; }

    setIsExporting(true);
    try {
      const res = await fetch('/api/export/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          generationIds: selectedIds,
          platforms: selectedPlatforms,
          format: 'zip',
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaignName ?? 'export'}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Export downloaded!');
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: select generations */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Select Creatives ({selectedIds.length}/{completed.length})
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={selectAll}>All</Button>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={deselectAll}>None</Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {completed.map((g) => (
            <label key={g.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <Checkbox checked={selectedIds.includes(g.id)} onCheckedChange={() => toggleId(g.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-1 italic text-muted-foreground">"{g.prompt}"</p>
                <p className="text-xs text-muted-foreground mt-0.5">{g.type.replace('_', ' ')} · {g.model}</p>
              </div>
              {(g.outputUrl ?? g.result) && g.type.startsWith('IMAGE_') && (
                <div className="h-10 w-10 rounded border overflow-hidden shrink-0">
                  <img
                    src={typeof g.result === 'string' && g.result.startsWith('http')
                      ? g.result
                      : `data:image/png;base64,${g.result}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </label>
          ))}

          {completed.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No completed generations yet. Generate some creatives first.
            </p>
          )}
        </div>
      </div>

      {/* Right: platform + export */}
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" /> Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormatSelector selectedPlatforms={selectedPlatforms} onToggle={togglePlatform} />
            <Separator />
            <PlatformPreview platforms={selectedPlatforms} />
            <Button className="w-full" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Packaging...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download ZIP</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
