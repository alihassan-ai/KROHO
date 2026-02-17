'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PLATFORM_LABELS, ALL_PLATFORMS } from '@/types/platform-specs';
import type { Generation } from '@/types/generation';

interface SaveToExportProps {
  results: Generation[];
  campaignId?: string;
}

export function SaveToExport({ results, campaignId }: SaveToExportProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['meta']);
  const [isExporting, setIsExporting] = useState(false);

  const completedResults = results.filter((r) => r.status === 'COMPLETED');

  const toggleId = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const togglePlatform = (p: string) =>
    setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

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
      a.download = `creative-export-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Export downloaded!');
      setOpen(false);
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Package className="h-4 w-4" />
        Export
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Export Package
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                SELECT GENERATIONS ({selectedIds.length}/{completedResults.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {completedResults.map((r) => (
                  <label key={r.id} className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={selectedIds.includes(r.id)}
                      onCheckedChange={() => toggleId(r.id)}
                    />
                    <span className="text-xs line-clamp-1">{r.prompt}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{r.type.replace('_', ' ')}</span>
                  </label>
                ))}
                {completedResults.length === 0 && (
                  <p className="text-xs text-muted-foreground">No completed generations yet.</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">TARGET PLATFORMS</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PLATFORMS.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedPlatforms.includes(p)}
                      onCheckedChange={() => togglePlatform(p)}
                    />
                    <span className="text-xs">{PLATFORM_LABELS[p]}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Packaging...</>
              ) : (
                <><Package className="mr-2 h-4 w-4" /> Download ZIP</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
