'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History } from 'lucide-react';
import { OutputCard } from './OutputCard';
import { NoGenerationsEmpty } from '@/components/shared/EmptyStates';
import type { Generation } from '@/types/generation';

interface OutputGalleryProps {
  results: Generation[];
  campaigns: { id: string; name: string }[];
  onFavorite: (id: string) => void;
  onSaveToCampaign: (genId: string, campaignId: string) => void;
  onVariation: (id: string) => void;
  mode: 'copy' | 'image' | 'variation';
}

export function OutputGallery({
  results, campaigns, onFavorite, onSaveToCampaign, onVariation, mode,
}: OutputGalleryProps) {
  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <NoGenerationsEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {results.map((result) => (
        <div key={result.id} className="space-y-4">
          {/* Result header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-[10px]">
                {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Badge>
              <Badge variant="secondary" className="capitalize text-[10px] h-5">{result.type.replace('_', ' ')}</Badge>
              <p className="text-xs text-muted-foreground italic line-clamp-1 max-w-[300px]">
                "{result.prompt}"
              </p>
            </div>
            <Select
              value={result.campaignId ?? ''}
              onValueChange={(val) => onSaveToCampaign(result.id, val)}
            >
              <SelectTrigger className="w-[160px] h-7 text-[10px]">
                <SelectValue placeholder="Save to campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <OutputCard
            result={result}
            campaigns={campaigns}
            onFavorite={onFavorite}
            onSaveToCampaign={onSaveToCampaign}
            onVariation={onVariation}
          />
        </div>
      ))}
    </div>
  );
}
