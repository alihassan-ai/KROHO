'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { usePlaygroundStore } from '@/stores/playground-store';
import { useGeneration } from './useGeneration';
import { useBrandContext } from './useBrandContext';
import { ASPECT_RATIOS } from '@/config/models';

export function usePlayground() {
  const store = usePlaygroundStore();
  const { generateCopy, generateImage, generateVariation, cancelPolling } = useGeneration();
  const { getBrandContext } = useBrandContext();

  const handleGenerate = useCallback(async () => {
    if (!store.prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (store.mode === 'copy') {
      await generateCopy({
        brandId: store.selectedBrandId || undefined,
        campaignId: store.selectedCampaignId || undefined,
        type: 'body',
        prompt: store.prompt,
        model: 'claude-sonnet',
        count: store.count,
        angle: store.angle,
        platform: store.format,
        useBrandContext: store.useBrandContext,
      });
    } else if (store.mode === 'image') {
      const ratio = ASPECT_RATIOS.find((r) => r.value === store.aspectRatio) ?? ASPECT_RATIOS[0];
      await generateImage({
        brandId: store.selectedBrandId || undefined,
        campaignId: store.selectedCampaignId || undefined,
        prompt: store.prompt,
        model: store.model,
        width: ratio.width,
        height: ratio.height,
        count: store.count,
        steps: store.steps,
        seed: store.seed ?? undefined,
        useBrandContext: store.useBrandContext,
      });
    }
  }, [store, generateCopy, generateImage]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!store.prompt.trim()) {
      toast.error('Enter a prompt first');
      return;
    }
    try {
      const brandCtx = store.selectedBrandId ? getBrandContext(store.selectedBrandId) : null;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enhance',
          prompt: store.prompt,
          mode: store.mode,
          model: store.model,
          brandContext: brandCtx,
        }),
      });
      if (!res.ok) throw new Error('Enhance failed');
      const data = await res.json();
      store.setEnhancedPrompt(data.enhancedPrompt);
      store.setPrompt(data.enhancedPrompt);
      toast.success('Prompt enhanced!');
    } catch {
      toast.error('Failed to enhance prompt');
    }
  }, [store, getBrandContext]);

  const handleUseBrain = useCallback(() => {
    if (!store.selectedBrandId) {
      toast.error('Select a brand first');
      return;
    }
    const ctx = getBrandContext(store.selectedBrandId);
    if (!ctx) {
      toast.error('Brand has no brain yet — analyze it first');
      return;
    }

    const lines: string[] = [];
    if (ctx.voice.tone) lines.push(`Tone: ${ctx.voice.tone}`);
    if (ctx.voice.style) lines.push(`Style: ${ctx.voice.style}`);
    if (ctx.visual.primaryColors.length) lines.push(`Colors: ${ctx.visual.primaryColors.join(', ')}`);
    if (ctx.voice.avoid.length) lines.push(`Avoid: ${ctx.voice.avoid.join(', ')}`);

    const contextNote = lines.join(' | ');
    store.setPrompt(store.prompt ? `${store.prompt}\n\n[Brand context: ${contextNote}]` : contextNote);
    toast.success('Brand context injected!');
  }, [store, getBrandContext]);

  const handleFavorite = useCallback(
    async (generationId: string) => {
      try {
        const result = store.results.find((r) => r.id === generationId);
        if (!result) return;
        const res = await fetch(`/api/generations/${generationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorited: !result.isFavorited }),
        });
        if (!res.ok) throw new Error('Failed');
        store.updateResult(generationId, { isFavorited: !result.isFavorited });
        toast.success(result.isFavorited ? 'Removed from favorites' : 'Added to favorites');
      } catch {
        toast.error('Failed to update favorite');
      }
    },
    [store]
  );

  const handleSaveToCampaign = useCallback(
    async (generationId: string, campaignId: string) => {
      try {
        const res = await fetch(`/api/generations/${generationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId }),
        });
        if (!res.ok) throw new Error('Failed');
        store.updateResult(generationId, { campaignId });
        toast.success('Saved to campaign!');
      } catch {
        toast.error('Failed to save to campaign');
      }
    },
    [store]
  );

  return {
    store,
    handleGenerate,
    handleEnhancePrompt,
    handleUseBrain,
    handleFavorite,
    handleSaveToCampaign,
    generateVariation,
    cancelPolling,
  };
}
