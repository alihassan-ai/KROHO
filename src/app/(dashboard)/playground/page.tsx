// NOTE: PlaygroundLayout is the new primary component.
// Legacy monolithic implementation preserved below for reference during transition.
// To use the new component-based approach, replace this file with:
//   import { PlaygroundLayout } from '@/components/playground/PlaygroundLayout';
//   export default function PlaygroundPage() { return <PlaygroundLayout />; }

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Loader2,
    Zap,
    History,
    Save,
    Copy,
    Check,
    ImageIcon,
    Type,
    Maximize2,
    RefreshCw,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function PlaygroundPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>('');

    // Mode & Common
    const [mode, setMode] = useState<'copy' | 'image'>('copy');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Copy Specs
    const [angle, setAngle] = useState('pain_point');
    const [format, setFormat] = useState('meta_static');

    // Image Specs
    const [model, setModel] = useState('flux-dev');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [useBrandContext, setUseBrandContext] = useState(true);

    const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandsRes = await fetch('/api/brands');
                const brandsData = await brandsRes.json();
                setBrands(brandsData);
                if (brandsData.length > 0) setSelectedBrand(brandsData[0].id);

                const campaignsRes = await fetch('/api/campaigns');
                const campaignsData = await campaignsRes.json();
                setCampaigns(campaignsData);
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();

        return () => {
            // Clean up polling intervals on unmount
            const intervals = pollingIntervals.current;
            Object.values(intervals).forEach(clearInterval);
        };
    }, []);

    const handleGenerate = async () => {
        if (!selectedBrand || !prompt) {
            toast.error('Please select a brand and enter a prompt');
            return;
        }

        setIsGenerating(true);
        try {
            if (mode === 'copy') {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    body: JSON.stringify({
                        brandId: selectedBrand,
                        prompt,
                        angle,
                        format,
                    }),
                });

                if (!response.ok) throw new Error('Generation failed');
                const data = await response.json();
                setResults([
                    {
                        type: 'copy',
                        id: data.id,
                        concepts: data.concepts,
                        timestamp: new Date(),
                        campaignId: null
                    },
                    ...results
                ]);
                toast.success('Creative concepts generated!');
            } else {
                // Image Generation
                const dims = aspectRatio === '1:1' ? { w: 1024, h: 1024 } :
                    aspectRatio === '16:9' ? { w: 1024, h: 576 } : { w: 576, h: 1024 };

                const response = await fetch('/api/generate/image', {
                    method: 'POST',
                    body: JSON.stringify({
                        brandId: selectedBrand,
                        prompt,
                        model,
                        width: dims.w,
                        height: dims.h,
                        useBrandContext,
                    }),
                });

                if (!response.ok) throw new Error('Image generation failed');
                const data = await response.json();

                const newResult = {
                    type: 'image',
                    id: data.generationId,
                    jobId: data.jobId,
                    status: 'PENDING',
                    prompt: prompt,
                    timestamp: new Date(),
                    campaignId: null,
                    imageUrl: null,
                    aspectRatio: aspectRatio,
                };

                setResults([newResult, ...results]);
                startPolling(data.jobId, data.generationId);
                toast.info('Image generation started...');
            }
        } catch (error) {
            toast.error('Failed to generate');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const startPolling = (jobId: string, generationId: string) => {
        if (pollingIntervals.current[generationId]) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/generate/status/${jobId}?generationId=${generationId}`);
                if (!res.ok) throw new Error('Polling failed');
                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    setResults(prev => prev.map(r =>
                        r.id === generationId ? { ...r, status: 'COMPLETED', imageUrl: data.output } : r
                    ));
                    clearInterval(interval);
                    delete pollingIntervals.current[generationId];
                    toast.success('Image generation complete!');
                } else if (data.status === 'FAILED') {
                    setResults(prev => prev.map(r =>
                        r.id === generationId ? { ...r, status: 'FAILED' } : r
                    ));
                    clearInterval(interval);
                    delete pollingIntervals.current[generationId];
                    toast.error('Image generation failed');
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000);

        pollingIntervals.current[generationId] = interval;
    };

    const handleSaveToCampaign = async (generationId: string, campaignId: string) => {
        try {
            const res = await fetch(`/api/generations/${generationId}`, {
                method: 'PATCH',
                body: JSON.stringify({ campaignId }),
            });
            if (!res.ok) throw new Error('Failed to save to campaign');

            setResults(prev => prev.map(r => r.id === generationId ? { ...r, campaignId } : r));
            toast.success('Saved to campaign!');
        } catch (error) {
            toast.error('Failed to save to campaign');
            console.error(error);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Sidebar Settings */}
            <aside className="w-80 border-r bg-muted/30 p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Playground</h2>
                    </div>

                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="copy" className="gap-2 text-xs">
                                <Type className="h-3.5 w-3.5" />
                                Copy
                            </TabsTrigger>
                            <TabsTrigger value="image" className="gap-2 text-xs">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Image
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Brand Context</Label>
                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === 'copy' ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Campaign Angle</Label>
                                    <Select value={angle} onValueChange={setAngle}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pain_point">Pain Point Focused</SelectItem>
                                            <SelectItem value="benefit">Benefit Driven</SelectItem>
                                            <SelectItem value="social_proof">Social Proof / UGC Style</SelectItem>
                                            <SelectItem value="fear_of_missing_out">FOMO / Urgency</SelectItem>
                                            <SelectItem value="curiosity">Curiosity / Hook</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Output Format</Label>
                                    <Select value={format} onValueChange={setFormat}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="meta_static">Meta Static Ad</SelectItem>
                                            <SelectItem value="meta_video">Meta Reel Script</SelectItem>
                                            <SelectItem value="tiktok_script">TikTok Script</SelectItem>
                                            <SelectItem value="google_search">Google Search Ad</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>AI Model</Label>
                                    <Select value={model} onValueChange={setModel}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flux-dev">FLUX.1 Dev (Quality)</SelectItem>
                                            <SelectItem value="sdxl-lightning">SDXL Lightning (Fast)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Aspect Ratio</Label>
                                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1:1">Square (1:1)</SelectItem>
                                            <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                                            <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <Label className="cursor-pointer text-sm" onClick={() => setUseBrandContext(!useBrandContext)}>Use Visual DNA</Label>
                                    <Button
                                        variant={useBrandContext ? "default" : "outline"}
                                        size="sm"
                                        className="h-6 px-2 text-[10px]"
                                        onClick={() => setUseBrandContext(!useBrandContext)}
                                    >
                                        {useBrandContext ? "ON" : "OFF"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mt-auto">
                    <Label className="text-sm font-semibold">{mode === 'copy' ? 'Creative Hook' : 'Visual Concept'}</Label>
                    <Textarea
                        placeholder={mode === 'copy' ? "What are we promoting?" : "Describe the image..."}
                        className="min-h-[100px] max-h-[160px] resize-none text-sm"
                        value={prompt}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    />
                    <Button
                        className="w-full mt-2 lg:h-12 shadow-lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {mode === 'copy' ? 'Generate Copy' : 'Generate Image'}
                            </>
                        )}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 bg-background">
                {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-inner">
                            <Sparkles className="h-10 w-10 text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-2xl font-bold">Creative Studio</h3>
                        <p className="text-muted-foreground mt-2">
                            {mode === 'copy'
                                ? "Select a brand and describe your campaign to generate high-converting copy."
                                : "Bring your brand visuals to life with AI-powered image generation built on your brand's DNA."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-6xl mx-auto">
                        {results.map((result) => (
                            <div key={result.id} className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Badge>
                                        <Badge variant="secondary" className="capitalize text-[10px] h-5">{result.type}</Badge>
                                        <h3 className="font-medium text-xs text-muted-foreground line-clamp-1 max-w-[400px] italic">
                                            "{result.prompt}"
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={result.campaignId || ""}
                                            onValueChange={(val) => handleSaveToCampaign(result.id, val)}
                                        >
                                            <SelectTrigger className="w-[160px] h-8 text-[10px]">
                                                <SelectValue placeholder="Add to campaign" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {campaigns.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <History className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {result.type === 'copy' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {result.concepts.map((concept: any, cIdx: number) => (
                                            <Card key={cIdx} className="overflow-hidden flex flex-col group border-primary/10 hover:border-primary/40 transition-all hover:shadow-md">
                                                <CardHeader className="bg-muted/30 pb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge className="bg-primary/10 text-primary border-none text-[10px] px-1.5 h-5">Concept {cIdx + 1}</Badge>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(concept.body, `${result.id}-c-${cIdx}`)}>
                                                                {copiedId === `${result.id}-c-${cIdx}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <CardTitle className="text-lg leading-tight font-bold">{concept.headline}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-6 flex-1 flex flex-col gap-4">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{concept.body}</p>
                                                    <div className="mt-auto pt-4 border-t border-dashed">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <ImageIcon className="h-3 w-3 text-muted-foreground" />
                                                            <Label className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Visual Cue</Label>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                                                            "{concept.visualPrompt}"
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center">
                                        <Card className="max-w-2xl w-full overflow-hidden border-primary/20 bg-muted/5 shadow-xl">
                                            <div className={cn(
                                                "aspect-square w-full relative group bg-muted/20",
                                                result.aspectRatio === '16:9' && "aspect-video",
                                                result.aspectRatio === '9:16' && "aspect-[9/16] max-h-[70vh] mx-auto"
                                            )}>
                                                {result.status === 'PENDING' ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 backdrop-blur-md bg-background/40">
                                                        <div className="relative">
                                                            <RefreshCw className="h-16 w-16 animate-spin text-primary opacity-20" />
                                                            <ImageIcon className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
                                                        </div>
                                                        <div className="text-center space-y-1.5">
                                                            <span className="text-sm font-semibold tracking-tight">Rendering via RunPod...</span>
                                                            <p className="text-[11px] text-muted-foreground animate-pulse">Estimated time: 30-45s</p>
                                                        </div>
                                                    </div>
                                                ) : result.status === 'FAILED' ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-destructive/5 backdrop-blur-sm">
                                                        <Zap className="h-12 w-12 text-destructive opacity-50" />
                                                        <div className="text-center">
                                                            <span className="text-sm font-bold text-destructive">Generation Failed</span>
                                                            <p className="text-xs text-muted-foreground mt-1">RunPod endpoint timeout</p>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={handleGenerate} className="mt-2 text-xs h-8">
                                                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                                            Try Again
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img
                                                            src={result.imageUrl?.startsWith('http') ? result.imageUrl : `data:image/png;base64,${result.imageUrl}`}
                                                            alt={result.prompt}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                                            <Button size="icon" variant="secondary" className="rounded-full h-14 w-14 shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                                                <Maximize2 className="h-7 w-7" />
                                                            </Button>
                                                            <Button size="icon" variant="secondary" className="rounded-full h-14 w-14 shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                                                <Download className="h-7 w-7" />
                                                            </Button>
                                                        </div>
                                                        <div className="absolute bottom-4 left-4">
                                                            <Badge className="bg-black/60 backdrop-blur-md border-white/20 text-white text-[10px] px-2 py-0.5 h-6">
                                                                {result.aspectRatio}
                                                            </Badge>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <CardContent className="p-4 border-t flex items-center justify-between bg-background">
                                                <div className="space-y-1 max-w-[60%]">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Prompt used</p>
                                                    <p className="text-xs line-clamp-1 italic text-foreground/70">"{result.prompt}"</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="secondary" size="sm" className="h-9 px-4 gap-2 text-xs font-semibold shadow-sm">
                                                        <Save className="h-3.5 w-3.5" />
                                                        Save to Library
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

