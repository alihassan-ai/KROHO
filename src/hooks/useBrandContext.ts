'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Brand } from '@/types/brand';
import { useBrandStore } from '@/stores/brand-store';

export function useBrandContext(brandId?: string) {
  const { brands, activeBrand, setActiveBrand, setBrands, setIsLoading, isLoading } =
    useBrandStore();
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/brands');
      if (!res.ok) throw new Error('Failed to fetch brands');
      const data: Brand[] = await res.json();
      setBrands(data);
      if (!activeBrand && data.length > 0) {
        setActiveBrand(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  }, [activeBrand, setActiveBrand, setBrands, setIsLoading]);

  useEffect(() => {
    if (brands.length === 0) {
      fetchBrands();
    }
  }, [brands.length, fetchBrands]);

  useEffect(() => {
    if (brandId) {
      const found = brands.find((b) => b.id === brandId);
      if (found) setActiveBrand(found);
    }
  }, [brandId, brands, setActiveBrand]);

  const getBrandContext = useCallback(
    (id?: string) => {
      const brand = id ? brands.find((b) => b.id === id) : activeBrand;
      if (!brand?.brain) return null;
      const brain = brand.brain;
      return {
        voice: {
          tone: brain.toneDescriptors.join(', '),
          style: brain.sentenceStyle,
          vocabulary: brain.vocabularyLevel,
          avoid: brain.bannedWords,
          cta: brain.ctaStyle,
          summary: brain.voiceSummary,
        },
        visual: {
          colors: [...brain.primaryColors, ...brain.secondaryColors],
          primaryColors: brain.primaryColors,
          imageStyle: brain.imageStyle,
          composition: brain.compositionNotes,
          summary: brain.visualSummary,
        },
        products: brain.products,
        audiences: brain.audiences,
        competitors: brain.competitors,
        summary: brain.brandSummary,
        winningPatterns: brain.winningPatterns,
      };
    },
    [brands, activeBrand]
  );

  return {
    brands,
    activeBrand,
    setActiveBrand,
    getBrandContext,
    fetchBrands,
    isLoading,
    error,
  };
}
