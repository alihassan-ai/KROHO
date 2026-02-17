'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Palette, Users, Package, Target } from 'lucide-react';
import type { BrandBrain } from '@/types/brand';

interface BrandBrainCardProps {
  brain: BrandBrain;
}

export function BrandBrainCard({ brain }: BrandBrainCardProps) {
  return (
    <div className="space-y-4">
      {/* Voice */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> Brand Voice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {brain.toneDescriptors?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Tone</p>
              <div className="flex flex-wrap gap-1.5">
                {brain.toneDescriptors.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}
          {brain.sentenceStyle && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Sentence Style</p>
              <p className="capitalize">{brain.sentenceStyle}</p>
            </div>
          )}
          {brain.vocabularyLevel && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Vocabulary</p>
              <p className="capitalize">{brain.vocabularyLevel}</p>
            </div>
          )}
          {brain.bannedWords?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Never Use</p>
              <div className="flex flex-wrap gap-1">
                {brain.bannedWords.map((w) => (
                  <Badge key={w} variant="destructive" className="text-[10px]">{w}</Badge>
                ))}
              </div>
            </div>
          )}
          {brain.voiceSummary && (
            <div className="rounded-md bg-muted/40 p-3 text-sm italic text-muted-foreground">
              {brain.voiceSummary}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual DNA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Visual DNA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {brain.primaryColors?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Primary Colors</p>
              <div className="flex gap-2 flex-wrap">
                {brain.primaryColors.map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: c }} />
                    <span className="text-xs font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {brain.secondaryColors?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Secondary Colors</p>
              <div className="flex gap-2 flex-wrap">
                {brain.secondaryColors.map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: c }} />
                    <span className="text-xs font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {brain.imageStyle && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Image Style</p>
              <p className="capitalize">{brain.imageStyle}</p>
            </div>
          )}
          {brain.compositionNotes && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Composition</p>
              <p className="text-muted-foreground">{brain.compositionNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      {brain.products && (brain.products as any[]).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(brain.products as any[]).map((p, i) => (
              <div key={i} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{p.name}</p>
                {p.usp && <p className="text-muted-foreground text-xs mt-0.5">{p.usp}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Audiences */}
      {brain.audiences && (brain.audiences as any[]).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Target Audiences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(brain.audiences as any[]).map((a, i) => (
              <div key={i} className="rounded-md border p-3 text-sm">
                <p className="font-semibold">{a.name}</p>
                {a.demographics && <p className="text-xs text-muted-foreground mt-0.5">{a.demographics}</p>}
                {a.painPoints?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {a.painPoints.map((pain: string) => (
                      <Badge key={pain} variant="outline" className="text-[10px]">{pain}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      {brain.brandSummary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> AI Brand Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{brain.brandSummary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
