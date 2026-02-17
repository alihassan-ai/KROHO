'use client';

import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { usePlaygroundStore } from '@/stores/playground-store';
import type { GenerateImageParams, GenerateCopyParams, GenerateVariationParams } from '@/types/generation';

export function useGeneration() {
  const { setIsGenerating, addResult, updateResult } = usePlaygroundStore();
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  const pollJobStatus = useCallback(
    (jobId: string, generationId: string) => {
      if (pollingIntervals.current[generationId]) return;

      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/generate/status/${jobId}?generationId=${generationId}`);
          if (!res.ok) throw new Error('Polling failed');
          const data = await res.json();

          if (data.status === 'COMPLETED') {
            updateResult(generationId, {
              status: 'COMPLETED',
              outputUrl: data.output,
              result: data.output,
            });
            clearInterval(interval);
            delete pollingIntervals.current[generationId];
            toast.success('Image generation complete!');
          } else if (data.status === 'FAILED') {
            updateResult(generationId, { status: 'FAILED' });
            clearInterval(interval);
            delete pollingIntervals.current[generationId];
            toast.error('Image generation failed');
          }
        } catch {
          // Polling errors are transient; keep polling
        }
      }, 3000);

      pollingIntervals.current[generationId] = interval;
    },
    [updateResult]
  );

  const generateCopy = useCallback(
    async (params: GenerateCopyParams) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Copy generation failed');
        const data = await res.json();

        addResult({
          id: data.id,
          userId: '',
          brandId: params.brandId ?? null,
          campaignId: params.campaignId ?? null,
          type: 'COPY_BODY',
          status: 'COMPLETED',
          prompt: params.prompt,
          fullPrompt: null,
          model: params.model,
          parameters: null,
          brandContext: null,
          result: data.concepts,
          outputUrl: null,
          thumbnailUrl: null,
          angle: params.angle ?? null,
          tone: params.tone ?? null,
          platform: params.platform ?? null,
          tags: [],
          isFavorited: false,
          isExported: false,
          createdAt: new Date().toISOString(),
        });
        toast.success('Creative concepts generated!');
      } catch {
        toast.error('Failed to generate copy');
      } finally {
        setIsGenerating(false);
      }
    },
    [addResult, setIsGenerating]
  );

  const generateImage = useCallback(
    async (params: GenerateImageParams) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error('Image generation failed');
        const data = await res.json();

        const placeholder = {
          id: data.generationId,
          userId: '',
          brandId: params.brandId ?? null,
          campaignId: params.campaignId ?? null,
          type: 'IMAGE_CONCEPT' as const,
          status: 'PENDING' as const,
          prompt: params.prompt,
          fullPrompt: null,
          model: params.model,
          parameters: { width: params.width, height: params.height, steps: params.steps },
          brandContext: null,
          result: null,
          outputUrl: null,
          thumbnailUrl: null,
          angle: null,
          tone: null,
          platform: null,
          tags: [],
          isFavorited: false,
          isExported: false,
          createdAt: new Date().toISOString(),
        };

        addResult(placeholder);
        pollJobStatus(data.jobId, data.generationId);
        toast.info('Image generation started...');
      } catch {
        toast.error('Failed to start image generation');
      } finally {
        setIsGenerating(false);
      }
    },
    [addResult, pollJobStatus, setIsGenerating]
  );

  const generateVariation = useCallback(
    async (variationParams: GenerateVariationParams) => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/generate/variations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variationParams),
        });
        if (!res.ok) throw new Error('Variation generation failed');
        const data = await res.json();

        if (data.type === 'IMAGE_VARIATION') {
          const placeholder = {
            id: data.generationId,
            userId: '',
            brandId: null,
            campaignId: null,
            type: 'IMAGE_VARIATION' as const,
            status: 'PENDING' as const,
            prompt: data.prompt ?? '',
            fullPrompt: null,
            model: data.model ?? 'flux-dev',
            parameters: null,
            brandContext: null,
            result: null,
            outputUrl: null,
            thumbnailUrl: null,
            angle: null,
            tone: null,
            platform: null,
            tags: [],
            isFavorited: false,
            isExported: false,
            createdAt: new Date().toISOString(),
          };
          addResult(placeholder);
          pollJobStatus(data.jobId, data.generationId);
          toast.info('Variation generation started...');
        } else {
          addResult(data);
          toast.success('Variation generated!');
        }
      } catch {
        toast.error('Failed to generate variation');
      } finally {
        setIsGenerating(false);
      }
    },
    [addResult, pollJobStatus, setIsGenerating]
  );

  const cancelPolling = useCallback(() => {
    Object.values(pollingIntervals.current).forEach(clearInterval);
    pollingIntervals.current = {};
  }, []);

  return { generateCopy, generateImage, generateVariation, cancelPolling };
}
