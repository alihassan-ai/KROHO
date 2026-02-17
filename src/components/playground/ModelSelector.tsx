'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AVAILABLE_MODELS, type ModelConfig } from '@/config/models';
import type { PlaygroundMode } from '@/types/generation';

interface ModelSelectorProps {
  mode: PlaygroundMode;
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ mode, value, onChange }: ModelSelectorProps) {
  const models: ModelConfig[] = mode === 'image' ? AVAILABLE_MODELS.image : AVAILABLE_MODELS.copy;

  return (
    <div className="space-y-2">
      <Label>AI Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <div className="flex items-center gap-2">
                <span>{m.icon}</span>
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {m.speed === 'fast' ? '⚡ fast' : '🎨 quality'}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {models.find((m) => m.id === value) && (
        <p className="text-xs text-muted-foreground">
          {models.find((m) => m.id === value)?.description}
        </p>
      )}
    </div>
  );
}
