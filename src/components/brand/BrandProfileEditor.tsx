'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { BrandBrain } from '@/types/brand';

interface BrandProfileEditorProps {
  brandId: string;
  brain: BrandBrain;
  onSaved?: (brain: BrandBrain) => void;
}

export function BrandProfileEditor({ brandId, brain, onSaved }: BrandProfileEditorProps) {
  const [saving, setSaving] = useState(false);

  const [toneDescriptors, setToneDescriptors] = useState(brain.toneDescriptors ?? []);
  const [bannedWords, setBannedWords] = useState(brain.bannedWords ?? []);
  const [primaryColors, setPrimaryColors] = useState(brain.primaryColors ?? []);
  const [brandSummary, setBrandSummary] = useState(brain.brandSummary ?? '');
  const [voiceSummary, setVoiceSummary] = useState(brain.voiceSummary ?? '');
  const [compositionNotes, setCompositionNotes] = useState(brain.compositionNotes ?? '');
  const [newTone, setNewTone] = useState('');
  const [newBanned, setNewBanned] = useState('');
  const [newColor, setNewColor] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/brands/${brandId}/brain`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toneDescriptors, bannedWords, primaryColors,
          brandSummary, voiceSummary, compositionNotes,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      onSaved?.(updated);
      toast.success('Brain saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Voice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Tone Descriptors</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {toneDescriptors.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button onClick={() => setToneDescriptors(toneDescriptors.filter((x) => x !== t))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="e.g. bold" value={newTone} onChange={(e) => setNewTone(e.target.value)} className="h-8 text-sm" />
              <Button variant="outline" size="sm" className="h-8" onClick={() => { if (newTone.trim()) { setToneDescriptors([...toneDescriptors, newTone.trim()]); setNewTone(''); } }}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Banned Words</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {bannedWords.map((w) => (
                <Badge key={w} variant="destructive" className="gap-1 text-[10px]">
                  {w}
                  <button onClick={() => setBannedWords(bannedWords.filter((x) => x !== w))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="e.g. cheap" value={newBanned} onChange={(e) => setNewBanned(e.target.value)} className="h-8 text-sm" />
              <Button variant="outline" size="sm" className="h-8" onClick={() => { if (newBanned.trim()) { setBannedWords([...bannedWords, newBanned.trim()]); setNewBanned(''); } }}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Voice Summary</Label>
            <Textarea value={voiceSummary} onChange={(e) => setVoiceSummary(e.target.value)} rows={3} className="text-sm resize-none" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Visual Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Primary Colors</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {primaryColors.map((c) => (
                <div key={c} className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
                  <span className="font-mono">{c}</span>
                  <button onClick={() => setPrimaryColors(primaryColors.filter((x) => x !== c))}>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="#FF5733" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-8 text-sm font-mono" />
              <Button variant="outline" size="sm" className="h-8" onClick={() => { if (newColor.trim()) { setPrimaryColors([...primaryColors, newColor.trim()]); setNewColor(''); } }}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Composition Notes</Label>
            <Textarea value={compositionNotes} onChange={(e) => setCompositionNotes(e.target.value)} rows={2} className="text-sm resize-none" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label className="text-xs">AI Brand Summary</Label>
        <Textarea value={brandSummary} onChange={(e) => setBrandSummary(e.target.value)} rows={4} className="text-sm resize-none" />
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
      </Button>
    </div>
  );
}
