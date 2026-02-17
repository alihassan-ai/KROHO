'use client';

import { Badge } from '@/components/ui/badge';
import { PLATFORM_SPECS, PLATFORM_LABELS } from '@/types/platform-specs';

interface PlatformPreviewProps {
  platforms: string[];
}

export function PlatformPreview({ platforms }: PlatformPreviewProps) {
  if (!platforms.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Will be resized to:
      </p>
      {platforms.map((platform) => {
        const specs = PLATFORM_SPECS[platform];
        if (!specs) return null;
        return (
          <div key={platform} className="space-y-1.5">
            <p className="text-xs font-semibold">{PLATFORM_LABELS[platform]}</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(specs).map((spec) => (
                <Badge key={spec.name} variant="outline" className="text-[10px] font-mono">
                  {spec.name} — {spec.width}×{spec.height}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
