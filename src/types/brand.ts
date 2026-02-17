export type BrandStatus = 'ONBOARDING' | 'ACTIVE' | 'ARCHIVED';
export type AssetType = 'BRAND_GUIDELINES' | 'LOGO' | 'PRODUCT_PHOTO' | 'EXAMPLE_AD' | 'FONT' | 'OTHER';

export interface BrandBrain {
  id: string;
  brandId: string;
  // Voice
  toneDescriptors: string[];
  sentenceStyle: string | null;
  vocabularyLevel: string | null;
  bannedWords: string[];
  ctaStyle: string | null;
  voiceSummary: string | null;
  // Visual
  primaryColors: string[];
  secondaryColors: string[];
  typography: string | null;
  imageStyle: string | null;
  compositionNotes: string | null;
  visualSummary: string | null;
  // Product
  products: Record<string, unknown>[] | null;
  valuePropositions: string[];
  differentiators: string[];
  // Audience
  audiences: Record<string, unknown>[] | null;
  // Competitive
  competitors: Record<string, unknown>[] | null;
  // AI Summary
  brandSummary: string | null;
  rawAnalysis: Record<string, unknown> | null;
  // Phase 2
  winningPatterns: Record<string, unknown> | null;
  hookPerformance: Record<string, unknown> | null;
  visualPerformance: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandAsset {
  id: string;
  brandId: string;
  type: AssetType;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Brand {
  id: string;
  userId: string;
  workspaceId?: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  status: BrandStatus;
  brain?: BrandBrain | null;
  assets?: BrandAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandContext {
  voice: {
    tone: string;
    style: string | null;
    vocabulary: string | null;
    avoid: string[];
    cta: string | null;
    summary: string | null;
  };
  visual: {
    colors: string[];
    primaryColors: string[];
    imageStyle: string | null;
    composition: string | null;
    summary: string | null;
  };
  products: Record<string, unknown>[] | null;
  audiences: Record<string, unknown>[] | null;
  competitors: Record<string, unknown>[] | null;
  summary: string | null;
  winningPatterns: Record<string, unknown> | null;
}
