import { create } from 'zustand';
import type { Brand } from '@/types/brand';

interface BrandState {
  brands: Brand[];
  activeBrand: Brand | null;
  isLoading: boolean;
  setBrands: (brands: Brand[]) => void;
  setActiveBrand: (brand: Brand | null) => void;
  setIsLoading: (v: boolean) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [],
  activeBrand: null,
  isLoading: false,
  setBrands: (brands) => set({ brands }),
  setActiveBrand: (brand) => set({ activeBrand: brand }),
  setIsLoading: (v) => set({ isLoading: v }),
  updateBrand: (id, updates) =>
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      activeBrand:
        state.activeBrand?.id === id ? { ...state.activeBrand, ...updates } : state.activeBrand,
    })),
}));
