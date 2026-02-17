'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

interface PromptBuilderProps {
  value: string;
  onChange: (v: string) => void;
  mode: 'copy' | 'image' | 'variation';
  onEnhance: () => void;
  onUseBrain: () => void;
  isEnhancing?: boolean;
  hasBrain?: boolean;
}

export function PromptBuilder({
  value, onChange, mode, onEnhance, onUseBrain, isEnhancing, hasBrain,
}: PromptBuilderProps) {
  const placeholder =
    mode === 'copy'
      ? 'What are we promoting? Describe the campaign goal...'
      : 'Describe the visual concept...';

  return (
    <div className="space-y-2">
      <Label className="font-semibold">{mode === 'copy' ? 'Creative Hook' : 'Visual Concept'}</Label>
      <Textarea
        placeholder={placeholder}
        className="min-h-[100px] max-h-[200px] resize-none text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs h-8"
          onClick={onEnhance}
          disabled={isEnhancing || !value.trim()}
        >
          {isEnhancing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          Enhance
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs h-8"
          onClick={onUseBrain}
          disabled={!hasBrain}
          title={!hasBrain ? 'Select a brand with an analyzed brain' : undefined}
        >
          <Brain className="h-3 w-3" />
          Use Brain
        </Button>
      </div>
    </div>
  );
}
