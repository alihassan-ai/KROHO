'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart, Copy, Check, ImageIcon, RefreshCw, Download,
  Maximize2, Zap, GitBranch, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Generation, CopyConcept } from '@/types/generation';

interface OutputCardProps {
  result: Generation;
  campaigns: { id: string; name: string }[];
  onFavorite: (id: string) => void;
  onSaveToCampaign: (genId: string, campaignId: string) => void;
  onVariation: (id: string) => void;
}

export function OutputCard({ result, campaigns, onFavorite, onSaveToCampaign, onVariation }: OutputCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const isCopy = result.type.startsWith('COPY_');

  if (isCopy) {
    const concepts = (result.result as CopyConcept[]) ?? [];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {concepts.map((concept, idx) => (
            <Card
              key={idx}
              className={cn(
                'flex flex-col group border-primary/10 hover:border-primary/40 transition-all hover:shadow-md',
                result.isFavorited && 'ring-1 ring-primary/30'
              )}
            >
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] px-1.5 h-5">
                    Concept {idx + 1}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => copyText(concept.body, idx)}
                    >
                      {copiedIdx === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => onFavorite(result.id)}
                    >
                      <Heart className={cn('h-3.5 w-3.5', result.isFavorited && 'fill-red-500 text-red-500')} />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base leading-tight font-bold">{concept.headline}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col gap-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{concept.body}</p>
                {concept.visualPrompt && (
                  <div className="mt-auto pt-3 border-t border-dashed">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ImageIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Visual Cue</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 italic">"{concept.visualPrompt}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Image result
  const imageUrl = result.outputUrl ?? (result.result as string | null);
  const params = result.parameters as Record<string, unknown> | null;
  const ratio = params?.width && params?.height
    ? `${params.width}×${params.height}`
    : '';

  return (
    <div className="flex justify-center">
      <Card className="max-w-2xl w-full overflow-hidden border-primary/20 bg-muted/5 shadow-xl">
        <div className={cn(
          'aspect-square w-full relative group bg-muted/20',
          result.parameters?.width === 1024 && result.parameters?.height === 576 && 'aspect-video',
          result.parameters?.width === 576 && result.parameters?.height === 1024 && 'aspect-[9/16] max-h-[70vh] mx-auto'
        )}>
          {result.status === 'PENDING' || result.status === 'PROCESSING' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 backdrop-blur-md bg-background/40">
              <div className="relative">
                <RefreshCw className="h-14 w-14 animate-spin text-primary opacity-20" />
                <ImageIcon className="h-7 w-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Rendering via RunPod...</p>
                <p className="text-xs text-muted-foreground animate-pulse mt-1">Estimated: 30–60s</p>
              </div>
            </div>
          ) : result.status === 'FAILED' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-destructive/5">
              <Zap className="h-12 w-12 text-destructive opacity-50" />
              <p className="text-sm font-bold text-destructive">Generation Failed</p>
            </div>
          ) : imageUrl ? (
            <>
              <img
                src={imageUrl.startsWith('http') ? imageUrl : `data:image/png;base64,${imageUrl}`}
                alt={result.prompt}
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] duration-700"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 shadow-2xl">
                  <Maximize2 className="h-6 w-6" />
                </Button>
                <Button
                  size="icon" variant="secondary" className="rounded-full h-12 w-12 shadow-2xl"
                  onClick={() => window.open(imageUrl.startsWith('http') ? imageUrl : `data:image/png;base64,${imageUrl}`, '_blank')}
                >
                  <Download className="h-6 w-6" />
                </Button>
                <Button
                  size="icon" variant="secondary" className="rounded-full h-12 w-12 shadow-2xl"
                  onClick={() => onVariation(result.id)}
                >
                  <GitBranch className="h-6 w-6" />
                </Button>
              </div>
              {ratio && (
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-black/60 backdrop-blur-md border-white/20 text-white text-[10px] px-2 h-5">
                    {ratio}
                  </Badge>
                </div>
              )}
            </>
          ) : null}
        </div>
        <CardContent className="p-4 border-t flex items-center justify-between bg-background">
          <p className="text-xs text-muted-foreground italic line-clamp-1 max-w-[60%]">"{result.prompt}"</p>
          <div className="flex gap-2">
            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => onFavorite(result.id)}
            >
              <Heart className={cn('h-4 w-4', result.isFavorited && 'fill-red-500 text-red-500')} />
            </Button>
            <Button
              variant="secondary" size="sm" className="h-8 px-3 text-xs gap-1.5"
              onClick={() => onVariation(result.id)}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Vary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
