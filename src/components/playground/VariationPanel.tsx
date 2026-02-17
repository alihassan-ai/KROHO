'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, Lock, Palette, Type, Layout } from 'lucide-react';
import type { GenerateVariationParams } from '@/types/generation';

interface VariationPanelProps {
  open: boolean;
  onClose: () => void;
  sourceGenerationId: string;
  onVariate: (params: GenerateVariationParams) => void;
}

type VariationType = 'seed_lock' | 'style_transfer' | 'prompt_tweak' | 'reformat';

export function VariationPanel({ open, onClose, sourceGenerationId, onVariate }: VariationPanelProps) {
  const [variationType, setVariationType] = useState<VariationType>('prompt_tweak');
  const [seed, setSeed] = useState('');
  const [targetModel, setTargetModel] = useState('flux-dev');
  const [promptAddition, setPromptAddition] = useState('');
  const [targetWidth, setTargetWidth] = useState('1080');
  const [targetHeight, setTargetHeight] = useState('1920');

  const handleGenerate = () => {
    onVariate({
      sourceGenerationId,
      variationType,
      params: {
        seed: seed ? Number(seed) : undefined,
        targetModel: variationType === 'style_transfer' ? targetModel : undefined,
        promptAddition: variationType === 'prompt_tweak' ? promptAddition : undefined,
        targetWidth: variationType === 'reformat' ? Number(targetWidth) : undefined,
        targetHeight: variationType === 'reformat' ? Number(targetHeight) : undefined,
      },
    });
    onClose();
  };

  const variations = [
    { type: 'seed_lock' as const,    icon: Lock,    label: 'Seed Lock',       desc: 'Keep composition, change details' },
    { type: 'style_transfer' as const, icon: Palette, label: 'Style Transfer', desc: 'Apply different model/style' },
    { type: 'prompt_tweak' as const, icon: Type,    label: 'Prompt Tweak',    desc: 'Edit prompt, regenerate' },
    { type: 'reformat' as const,     icon: Layout,  label: 'Platform Reformat', desc: 'Same image, different aspect ratio' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Generate Variation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {variations.map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => setVariationType(type)}
                className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/50 ${
                  variationType === type ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>

          {variationType === 'seed_lock' && (
            <div className="space-y-2">
              <Label className="text-xs">Seed (leave blank for random)</Label>
              <Input placeholder="e.g. 42" value={seed} onChange={(e) => setSeed(e.target.value)} className="h-8" />
            </div>
          )}

          {variationType === 'style_transfer' && (
            <div className="space-y-2">
              <Label className="text-xs">Target Model</Label>
              <Select value={targetModel} onValueChange={setTargetModel}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flux-dev">FLUX.1 Dev (Quality)</SelectItem>
                  <SelectItem value="sdxl-lightning">SDXL Lightning (Fast)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {variationType === 'prompt_tweak' && (
            <div className="space-y-2">
              <Label className="text-xs">Additional direction</Label>
              <Textarea
                placeholder="Add to prompt... e.g. 'more dramatic lighting'"
                value={promptAddition}
                onChange={(e) => setPromptAddition(e.target.value)}
                className="h-20 resize-none text-sm"
              />
            </div>
          )}

          {variationType === 'reformat' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Width</Label>
                <Input value={targetWidth} onChange={(e) => setTargetWidth(e.target.value)} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height</Label>
                <Input value={targetHeight} onChange={(e) => setTargetHeight(e.target.value)} className="h-8" />
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleGenerate}>
            <GitBranch className="mr-2 h-4 w-4" />
            Generate Variation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
