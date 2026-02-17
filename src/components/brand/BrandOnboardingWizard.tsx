'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowRight, Sparkles, Globe, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AssetUploader } from './AssetUploader';

const STEPS = [
  { title: 'Brand Info', description: 'Name and website' },
  { title: 'Upload Assets', description: 'Guidelines, logos, example ads' },
  { title: 'Analyze Brain', description: 'AI builds your brand intelligence' },
];

export function BrandOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');

  const handleCreateBrand = async () => {
    if (!name.trim()) { toast.error('Brand name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), website: website.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Failed to create brand');
      const brand = await res.json();
      setBrandId(brand.id);
      setStep(1);
    } catch {
      toast.error('Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brands/${brandId}/analyze`, { method: 'POST' });
      if (!res.ok) throw new Error('Analysis failed');
      setStep(2);
      toast.success('Analysis started! This may take a minute.');
      setTimeout(() => router.push(`/brands/${brandId}`), 3000);
    } catch {
      toast.error('Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step].title}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Brand Info
            </CardTitle>
            <CardDescription>Give your brand an identity in Creative Ops.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Brand Name *</Label>
              <Input placeholder="Acme Corp" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Website (optional)
              </Label>
              <Input placeholder="https://acme.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <Button className="w-full mt-2" onClick={handleCreateBrand} disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && brandId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Upload Brand Assets
            </CardTitle>
            <CardDescription>
              Upload brand guidelines (PDF), logos, and example ads. The AI will extract your brand DNA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AssetUploader brandId={brandId} />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => handleAnalyze()}>
                Skip — Analyze Now
              </Button>
              <Button className="flex-1" onClick={() => handleAnalyze()} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-primary/30 bg-primary/5 text-center">
          <CardContent className="py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">Analyzing Brand Brain...</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Claude is extracting your brand voice, visual DNA, and audience insights.
                This takes 30–60 seconds.
              </p>
            </div>
            <p className="text-xs text-muted-foreground animate-pulse">Redirecting to your brand workspace...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
