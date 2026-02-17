export interface ModelConfig {
  id: string;
  name: string;
  provider: 'runpod' | 'anthropic' | 'openrouter';
  speed: 'fast' | 'quality';
  icon: string;
  description: string;
  defaultSteps?: number;
  maxResolution?: number;
}

export const AVAILABLE_MODELS: { image: ModelConfig[]; copy: ModelConfig[] } = {
  image: [
    {
      id: 'flux-dev',
      name: 'FLUX.1 Dev',
      provider: 'runpod',
      speed: 'quality',
      icon: '🎨',
      description: 'Highest quality, great for hero images',
      defaultSteps: 28,
      maxResolution: 2048,
    },
    {
      id: 'sdxl-lightning',
      name: 'SDXL Lightning',
      provider: 'runpod',
      speed: 'fast',
      icon: '⚡',
      description: 'Sub-second generation, great for iterations',
      defaultSteps: 4,
      maxResolution: 1024,
    },
  ],
  copy: [
    {
      id: 'claude-sonnet',
      name: 'Claude Sonnet',
      provider: 'anthropic',
      speed: 'quality',
      icon: '🧠',
      description: 'Best for nuanced brand voice',
    },
    {
      id: 'claude-opus',
      name: 'Claude Opus',
      provider: 'anthropic',
      speed: 'quality',
      icon: '🏆',
      description: 'Most powerful, use for complex brand analysis',
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'openrouter',
      speed: 'fast',
      icon: '⚡',
      description: 'Fast and cheap for simple variations',
    },
  ],
};

export const IMAGE_MODEL_IDS = AVAILABLE_MODELS.image.map((m) => m.id);
export const COPY_MODEL_IDS = AVAILABLE_MODELS.copy.map((m) => m.id);

export function getModelConfig(id: string): ModelConfig | undefined {
  return [...AVAILABLE_MODELS.image, ...AVAILABLE_MODELS.copy].find((m) => m.id === id);
}

export const ASPECT_RATIOS = [
  { label: 'Square (1:1)',    value: '1:1',   width: 1024, height: 1024 },
  { label: 'Landscape (16:9)', value: '16:9', width: 1024, height: 576  },
  { label: 'Portrait (9:16)', value: '9:16',  width: 576,  height: 1024 },
  { label: 'Portrait (4:5)',  value: '4:5',   width: 1024, height: 1280 },
];

export const COPY_ANGLES = [
  { label: 'Pain Point',   value: 'pain_point'        },
  { label: 'Benefit',      value: 'benefit'            },
  { label: 'Social Proof', value: 'social_proof'       },
  { label: 'FOMO/Urgency', value: 'fear_of_missing_out'},
  { label: 'Curiosity',    value: 'curiosity'          },
];

export const COPY_FORMATS = [
  { label: 'Meta Static Ad',   value: 'meta_static'    },
  { label: 'Meta Reel Script', value: 'meta_video'     },
  { label: 'TikTok Script',    value: 'tiktok_script'  },
  { label: 'Google Search Ad', value: 'google_search'  },
];
