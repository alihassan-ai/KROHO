export type GenerationType =
  | 'COPY_HEADLINE'
  | 'COPY_HOOK'
  | 'COPY_BODY'
  | 'COPY_CTA'
  | 'COPY_SCRIPT'
  | 'IMAGE_CONCEPT'
  | 'IMAGE_VARIATION'
  | 'COPY_VARIATION';

export type GenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface GenerationParameters {
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  count?: number;
  runpodId?: string;
  [key: string]: unknown;
}

export interface CopyConcept {
  headline: string;
  body: string;
  visualPrompt: string;
  angleUsed: string;
  variants: string[];
}

export interface Generation {
  id: string;
  userId: string;
  brandId: string | null;
  campaignId: string | null;
  type: GenerationType;
  status: GenerationStatus;
  prompt: string;
  fullPrompt: string | null;
  model: string;
  parameters: GenerationParameters | null;
  brandContext: Record<string, unknown> | null;
  result: CopyConcept[] | string | null;
  outputUrl: string | null;
  thumbnailUrl: string | null;
  angle: string | null;
  tone: string | null;
  platform: string | null;
  tags: string[];
  isFavorited: boolean;
  isExported: boolean;
  createdAt: string;
}

export type ImageModel = 'flux-dev' | 'sdxl-lightning';
export type CopyModel = 'claude-sonnet' | 'claude-opus' | 'mistral-7b';
export type AnyModel = ImageModel | CopyModel;

export interface GenerateImageParams {
  brandId?: string;
  campaignId?: string;
  prompt: string;
  model: ImageModel;
  width: number;
  height: number;
  count?: number;
  steps?: number;
  seed?: number;
  useBrandContext: boolean;
}

export interface GenerateCopyParams {
  brandId?: string;
  campaignId?: string;
  type: 'headline' | 'hook' | 'body' | 'cta' | 'script';
  prompt: string;
  model: string;
  count: number;
  angle?: string;
  tone?: string;
  platform?: string;
  useBrandContext: boolean;
}

export interface GenerateVariationParams {
  sourceGenerationId: string;
  variationType: 'seed_lock' | 'style_transfer' | 'prompt_tweak' | 'reformat';
  params: {
    seed?: number;
    targetModel?: string;
    promptAddition?: string;
    targetPlatform?: string;
    targetWidth?: number;
    targetHeight?: number;
  };
}

export interface GenerationJobResult {
  jobId: string;
  generationId?: string;
}

export type PlaygroundMode = 'copy' | 'image' | 'variation';
