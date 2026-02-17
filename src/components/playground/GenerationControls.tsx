'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ASPECT_RATIOS, COPY_ANGLES, COPY_FORMATS } from '@/config/models';
import type { PlaygroundMode } from '@/types/generation';

interface GenerationControlsProps {
  mode: PlaygroundMode;
  // Copy
  angle: string;
  onAngleChange: (v: string) => void;
  format: string;
  onFormatChange: (v: string) => void;
  // Image
  aspectRatio: string;
  onAspectRatioChange: (v: string) => void;
  steps: number;
  onStepsChange: (v: number) => void;
  seed: number | null;
  onSeedChange: (v: number | null) => void;
  count: number;
  onCountChange: (v: number) => void;
}

export function GenerationControls({
  mode, angle, onAngleChange, format, onFormatChange,
  aspectRatio, onAspectRatioChange, steps, onStepsChange,
  seed, onSeedChange, count, onCountChange,
}: GenerationControlsProps) {
  return (
    <div className="space-y-4">
      {mode === 'copy' ? (
        <>
          <div className="space-y-2">
            <Label>Campaign Angle</Label>
            <Select value={angle} onValueChange={onAngleChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COPY_ANGLES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select value={format} onValueChange={onFormatChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COPY_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Steps</Label>
              <Input
                type="number" min={1} max={50}
                value={steps}
                onChange={(e) => onStepsChange(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Seed</Label>
              <Input
                type="number"
                placeholder="random"
                value={seed ?? ''}
                onChange={(e) => onSeedChange(e.target.value ? Number(e.target.value) : null)}
                className="h-9"
              />
            </div>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label>Count</Label>
        <Select value={String(count)} onValueChange={(v) => onCountChange(Number(v))}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 6].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'result' : 'results'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
