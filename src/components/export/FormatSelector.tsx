'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PLATFORM_LABELS, ALL_PLATFORMS } from '@/types/platform-specs';

interface FormatSelectorProps {
  selectedPlatforms: string[];
  onToggle: (platform: string) => void;
}

export function FormatSelector({ selectedPlatforms, onToggle }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Target Platforms
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {ALL_PLATFORMS.map((platform) => (
          <label key={platform} className="flex items-center gap-2 cursor-pointer rounded-md border p-2.5 hover:bg-muted/40 transition-colors">
            <Checkbox
              checked={selectedPlatforms.includes(platform)}
              onCheckedChange={() => onToggle(platform)}
            />
            <span className="text-sm">{PLATFORM_LABELS[platform]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
