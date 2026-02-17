'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Download, ImageIcon, Type, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Campaign } from '@/types/campaign';
import type { Generation, CopyConcept } from '@/types/generation';

interface CampaignWorkspaceProps {
  campaign: Campaign;
  generations: Generation[];
  onExport: () => void;
}

export function CampaignWorkspace({ campaign, generations, onExport }: CampaignWorkspaceProps) {
  const copyGens = generations.filter((g) => g.type.startsWith('COPY_'));
  const imageGens = generations.filter((g) => g.type.startsWith('IMAGE_'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
            {campaign.objective && (
              <><span>·</span><span className="capitalize">{campaign.objective}</span></>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`/playground?campaignId=${campaign.id}`}>
              <Sparkles className="h-4 w-4" /> Playground
            </Link>
          </Button>
        </div>
      </div>

      {/* Platform badges */}
      {campaign.platforms?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {campaign.platforms.map((p) => (
            <Badge key={p} variant="outline" className="capitalize">{p}</Badge>
          ))}
        </div>
      )}

      {/* Generations */}
      <Tabs defaultValue="copy">
        <TabsList>
          <TabsTrigger value="copy" className="gap-1.5">
            <Type className="h-4 w-4" /> Copy ({copyGens.length})
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-1.5">
            <ImageIcon className="h-4 w-4" /> Images ({imageGens.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="copy" className="mt-4">
          {copyGens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No copy generated yet.{' '}
              <Link href={`/playground?campaignId=${campaign.id}`} className="text-primary underline">
                Go to Playground
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {copyGens.map((gen) => {
                const concepts = (gen.result as CopyConcept[]) ?? [];
                return (
                  <Card key={gen.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground italic">
                          "{gen.prompt}"
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(gen.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {concepts.map((c, i) => (
                          <div key={i} className="rounded-md border p-3 text-sm space-y-1.5">
                            <p className="font-semibold text-sm">{c.headline}</p>
                            <p className="text-xs text-muted-foreground line-clamp-3">{c.body}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          {imageGens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No images generated yet.{' '}
              <Link href={`/playground?campaignId=${campaign.id}`} className="text-primary underline">
                Go to Playground
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {imageGens.map((gen) => {
                const url = gen.outputUrl ?? (gen.result as string | null);
                return (
                  <div key={gen.id} className="rounded-lg border overflow-hidden group">
                    {url ? (
                      <img
                        src={url.startsWith('http') ? url : `data:image/png;base64,${url}`}
                        alt={gen.prompt}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-[10px] text-muted-foreground italic line-clamp-1">"{gen.prompt}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
