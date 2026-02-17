'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Zap, Type, ImageIcon } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { GenerationControls } from './GenerationControls';
import { PromptBuilder } from './PromptBuilder';
import { OutputGallery } from './OutputGallery';
import { BrandContextPanel } from './BrandContextPanel';
import { VariationPanel } from './VariationPanel';
import { SaveToExport } from './SaveToExport';
import { usePlayground } from '@/hooks/usePlayground';
import { useBrandContext } from '@/hooks/useBrandContext';
import type { Brand } from '@/types/brand';

export function PlaygroundLayout() {
  const { store, handleGenerate, handleEnhancePrompt, handleUseBrain, handleFavorite, handleSaveToCampaign, generateVariation } = usePlayground();
  const { brands, getBrandContext } = useBrandContext();

  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [variationSourceId, setVariationSourceId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then(setCampaigns)
      .catch(console.error);
  }, []);

  const activeBrandCtx = store.selectedBrandId ? getBrandContext(store.selectedBrandId) : null;
  const hasBrain = Boolean(activeBrandCtx);

  const onEnhance = async () => {
    setIsEnhancing(true);
    await handleEnhancePrompt();
    setIsEnhancing(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Control Panel */}
        <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Playground</h2>
              <div className="ml-auto">
                <SaveToExport results={store.results} campaignId={store.selectedCampaignId} />
              </div>
            </div>

            <Tabs value={store.mode} onValueChange={(v) => store.setMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="copy" className="gap-1.5 text-xs">
                  <Type className="h-3.5 w-3.5" /> Copy
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-1.5 text-xs">
                  <ImageIcon className="h-3.5 w-3.5" /> Image
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={store.selectedBrandId} onValueChange={store.setSelectedBrandId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {(brands as Brand[]).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Campaign (optional)</Label>
              <Select value={store.selectedCampaignId} onValueChange={store.setSelectedCampaignId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="No campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {store.mode === 'image' && (
              <ModelSelector
                mode={store.mode}
                value={store.model}
                onChange={(v) => store.setModel(v as any)}
              />
            )}

            <GenerationControls
              mode={store.mode}
              angle={store.angle} onAngleChange={store.setAngle}
              format={store.format} onFormatChange={store.setFormat}
              aspectRatio={store.aspectRatio} onAspectRatioChange={store.setAspectRatio}
              steps={store.steps} onStepsChange={store.setSteps}
              seed={store.seed} onSeedChange={store.setSeed}
              count={store.count} onCountChange={store.setCount}
            />
          </div>

          {/* Prompt + Generate — pinned to bottom */}
          <div className="border-t p-4 space-y-3 bg-background/80">
            <PromptBuilder
              value={store.prompt}
              onChange={store.setPrompt}
              mode={store.mode}
              onEnhance={onEnhance}
              onUseBrain={handleUseBrain}
              isEnhancing={isEnhancing}
              hasBrain={hasBrain}
            />
            <Button
              className="w-full shadow-lg"
              onClick={handleGenerate}
              disabled={store.isGenerating || !store.prompt.trim()}
            >
              {store.isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />{store.mode === 'copy' ? 'Generate Copy' : 'Generate Image'}</>
              )}
            </Button>
          </div>
        </aside>

        {/* Output Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <OutputGallery
            results={store.results}
            campaigns={campaigns}
            onFavorite={handleFavorite}
            onSaveToCampaign={handleSaveToCampaign}
            onVariation={(id) => setVariationSourceId(id)}
            mode={store.mode}
          />
        </main>
      </div>

      {/* Brand Context Panel — bottom bar */}
      {activeBrandCtx && (
        <BrandContextPanel
          context={activeBrandCtx}
          brandName={(brands as Brand[]).find((b) => b.id === store.selectedBrandId)?.name}
        />
      )}

      {/* Variation Modal */}
      {variationSourceId && (
        <VariationPanel
          open={Boolean(variationSourceId)}
          onClose={() => setVariationSourceId(null)}
          sourceGenerationId={variationSourceId}
          onVariate={generateVariation}
        />
      )}
    </div>
  );
}
