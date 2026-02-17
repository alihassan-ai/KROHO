'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BrandContext } from '@/types/brand';

interface BrandContextPanelProps {
  context: BrandContext | null;
  brandName?: string;
}

export function BrandContextPanel({ context, brandName }: BrandContextPanelProps) {
  const [open, setOpen] = useState(false);

  if (!context) return null;

  return (
    <div className="border-t bg-muted/20">
      <button
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>🧠 Brand Context{brandName ? ` — ${brandName}` : ''}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-2.5 text-xs">
          {context.voice.tone && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-muted-foreground w-16 shrink-0">Voice</span>
              <span className="text-foreground">{context.voice.tone}</span>
            </div>
          )}
          {context.visual.primaryColors.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-muted-foreground w-16 shrink-0">Colors</span>
              <div className="flex gap-1 flex-wrap">
                {context.visual.primaryColors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono"
                    style={{ backgroundColor: c + '22', color: c }}
                  >
                    <span
                      className="h-2 w-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: c }}
                    />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {context.voice.avoid.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-muted-foreground w-16 shrink-0">Avoid</span>
              <div className="flex gap-1 flex-wrap">
                {context.voice.avoid.map((w) => (
                  <Badge key={w} variant="destructive" className="text-[10px] h-4 px-1">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {context.summary && (
            <div className="flex items-start gap-2">
              <span className="font-semibold text-muted-foreground w-16 shrink-0">Summary</span>
              <span className="text-foreground/80 line-clamp-2">{context.summary}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
