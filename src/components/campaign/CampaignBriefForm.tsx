'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const PLATFORMS = ['meta', 'tiktok', 'google', 'linkedin', 'youtube'];
const FORMATS = ['static', 'video_script', 'carousel', 'story'];
const OBJECTIVES = [
  { value: 'awareness',      label: 'Brand Awareness' },
  { value: 'consideration',  label: 'Consideration' },
  { value: 'conversion',     label: 'Conversion / Sales' },
  { value: 'retention',      label: 'Retention / LTV' },
];

interface CampaignBriefFormProps {
  brandId?: string;
  onCreated?: (campaign: { id: string; name: string }) => void;
}

export function CampaignBriefForm({ brandId, onCreated }: CampaignBriefFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('conversion');
  const [platforms, setPlatforms] = useState<string[]>(['meta']);
  const [formats, setFormats] = useState<string[]>(['static']);
  const [instructions, setInstructions] = useState('');

  const togglePlatform = (p: string) =>
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  const toggleFormat = (f: string) =>
    setFormats((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Campaign name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brandId, objective, platforms, formats, instructions }),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      const campaign = await res.json();
      toast.success('Campaign created!');
      onCreated?.(campaign);
      if (!onCreated) router.push(`/campaigns/${campaign.id}`);
    } catch {
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Campaign Name *</Label>
        <Input placeholder="Summer Sale 2026" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Objective</Label>
        <Select value={objective} onValueChange={setObjective}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {OBJECTIVES.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Platforms</Label>
        <div className="grid grid-cols-3 gap-2">
          {PLATFORMS.map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={platforms.includes(p)} onCheckedChange={() => togglePlatform(p)} />
              <span className="text-sm capitalize">{p}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Creative Formats</Label>
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={formats.includes(f)} onCheckedChange={() => toggleFormat(f)} />
              <span className="text-sm capitalize">{f.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Special Instructions (optional)</Label>
        <Textarea
          placeholder="Any specific direction for creatives..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
        ) : (
          <><FolderKanban className="mr-2 h-4 w-4" /> Create Campaign</>
        )}
      </Button>
    </div>
  );
}
