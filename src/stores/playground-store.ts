import { create } from 'zustand';
import type { Generation, PlaygroundMode, ImageModel } from '@/types/generation';

interface PlaygroundState {
  // Mode
  mode: PlaygroundMode;
  setMode: (mode: PlaygroundMode) => void;

  // Brand/Campaign context
  selectedBrandId: string;
  selectedCampaignId: string;
  setSelectedBrandId: (id: string) => void;
  setSelectedCampaignId: (id: string) => void;

  // Prompt
  prompt: string;
  setPrompt: (prompt: string) => void;
  enhancedPrompt: string | null;
  setEnhancedPrompt: (p: string | null) => void;

  // Copy settings
  angle: string;
  setAngle: (angle: string) => void;
  format: string;
  setFormat: (format: string) => void;

  // Image settings
  model: ImageModel;
  setModel: (model: ImageModel) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  steps: number;
  setSteps: (steps: number) => void;
  seed: number | null;
  setSeed: (seed: number | null) => void;
  useBrandContext: boolean;
  setUseBrandContext: (use: boolean) => void;
  count: number;
  setCount: (count: number) => void;

  // Results
  results: Generation[];
  addResult: (result: Generation) => void;
  updateResult: (id: string, updates: Partial<Generation>) => void;
  clearResults: () => void;

  // UI state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  isBrandContextOpen: boolean;
  setIsBrandContextOpen: (v: boolean) => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  mode: 'copy',
  setMode: (mode) => set({ mode }),

  selectedBrandId: '',
  selectedCampaignId: '',
  setSelectedBrandId: (id) => set({ selectedBrandId: id }),
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),

  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  enhancedPrompt: null,
  setEnhancedPrompt: (p) => set({ enhancedPrompt: p }),

  angle: 'pain_point',
  setAngle: (angle) => set({ angle }),
  format: 'meta_static',
  setFormat: (format) => set({ format }),

  model: 'flux-dev',
  setModel: (model) => set({ model }),
  aspectRatio: '1:1',
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  steps: 28,
  setSteps: (steps) => set({ steps }),
  seed: null,
  setSeed: (seed) => set({ seed }),
  useBrandContext: true,
  setUseBrandContext: (use) => set({ useBrandContext: use }),
  count: 3,
  setCount: (count) => set({ count }),

  results: [],
  addResult: (result) => set((state) => ({ results: [result, ...state.results] })),
  updateResult: (id, updates) =>
    set((state) => ({
      results: state.results.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  clearResults: () => set({ results: [] }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  isBrandContextOpen: false,
  setIsBrandContextOpen: (v) => set({ isBrandContextOpen: v }),
}));
