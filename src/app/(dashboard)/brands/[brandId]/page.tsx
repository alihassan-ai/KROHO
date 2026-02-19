'use client';

export const dynamic = "force-dynamic";

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles, FileText, ImageIcon, Settings, Globe, Loader2,
    Target, Users, BarChart3, Layers, Zap, TrendingUp,
    ChevronRight, ExternalLink, Brain, PieChart, Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { AssetUploader } from '@/components/brand/AssetUploader';
import { toast } from 'sonner';

// ── Helper components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
            {children}
        </div>
    );
}

function ColorSwatch({ color }: { color: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="h-10 w-10 rounded-lg border shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
            />
            <span className="text-[10px] text-muted-foreground font-mono">{color}</span>
        </div>
    );
}

function TagList({ items }: { items: string[] }) {
    if (!items?.length) return <p className="text-sm text-muted-foreground italic">Not defined</p>;
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex gap-3 py-2 border-b last:border-0">
            <span className="text-sm text-muted-foreground min-w-[140px] shrink-0">{label}</span>
            <span className="text-sm">{value}</span>
        </div>
    );
}

// ── Platform Config ───────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
    meta:     { label: 'Meta / Instagram',  color: 'border-blue-500/30 bg-blue-500/5',    emoji: '📘' },
    tiktok:   { label: 'TikTok',            color: 'border-pink-500/30 bg-pink-500/5',    emoji: '🎵' },
    google:   { label: 'Google Ads',        color: 'border-green-500/30 bg-green-500/5',  emoji: '🔍' },
    linkedin: { label: 'LinkedIn',          color: 'border-sky-500/30 bg-sky-500/5',      emoji: '💼' },
    email:    { label: 'Email',             color: 'border-amber-500/30 bg-amber-500/5',  emoji: '✉️'  },
};

// ── Archetype emoji map ───────────────────────────────────────────────────────
const ARCHETYPE_EMOJI: Record<string, string> = {
    Hero: '⚔️', Sage: '🦉', Explorer: '🧭', Outlaw: '🔥', Creator: '✨',
    Ruler: '👑', Magician: '🪄', Lover: '💎', Jester: '😄', Everyman: '🤝',
    Caregiver: '💚', Innocent: '🌸',
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrandDetailPage() {
    const params = useParams();
    const brandId = params.brandId as string;
    const [brand, setBrand] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    const fetchBrand = async () => {
        try {
            const response = await fetch(`/api/brands/${brandId}`);
            if (!response.ok) throw new Error('Failed to fetch brand');
            const data = await response.json();
            setBrand(data);
            if (data.status === 'ACTIVE') stopPolling();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchBrand(); return stopPolling; }, [brandId]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        stopPolling();
        try {
            const response = await fetch(`/api/brands/${brandId}/analyze`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to start analysis');
            toast.success('Analysis started! Building your Brand Brain...');
            pollRef.current = setInterval(async () => {
                const r = await fetch(`/api/brands/${brandId}`);
                if (!r.ok) return;
                const data = await r.json();
                setBrand(data);
                if (data.status === 'ACTIVE') {
                    stopPolling();
                    setIsAnalyzing(false);
                    toast.success('Brand Brain is ready!');
                }
            }, 8000);
        } catch (error) {
            toast.error('Failed to start analysis');
            console.error(error);
            setIsAnalyzing(false);
        }
    };

    const handleDeleteAsset = async (assetId: string) => {
        setDeletingAssetId(assetId);
        try {
            const res = await fetch(`/api/brands/${brandId}/assets/${assetId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Asset deleted');
            fetchBrand();
        } catch {
            toast.error('Failed to delete asset');
        } finally {
            setDeletingAssetId(null);
        }
    };

    const handleRefine = async () => {
        setIsRefining(true);
        try {
            const response = await fetch(`/api/brands/${brandId}/refine`, { method: 'POST' });
            if (!response.ok) { const d = await response.json(); throw new Error(d.message || 'Failed'); }
            toast.success('Brain refined with performance insights!');
            fetchBrand();
        } catch (error: any) {
            toast.error(error.message || 'Failed to refine');
        } finally {
            setIsRefining(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!brand) return <div>Brand not found</div>;

    const brain = brand.brain;

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
                        {brand.logoUrl ? (
                            <Image src={brand.logoUrl} alt={brand.name} width={64} height={64}
                                className="object-contain w-full h-full" unoptimized />
                        ) : (
                            <span className="text-2xl font-bold text-primary">{brand.name[0]}</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
                            <Badge variant={brand.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {brand.status}
                            </Badge>
                            {brain?.brandArchetype && (
                                <Badge variant="outline" className="gap-1">
                                    {ARCHETYPE_EMOJI[brain.brandArchetype] || '🎯'} {brain.brandArchetype}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-muted-foreground flex-wrap">
                            {brand.website && (
                                <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm hover:text-foreground transition-colors">
                                    <Globe className="h-3 w-3" /> {brand.website}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            {brain?.marketCategory && (
                                <span className="text-sm">{brain.marketCategory}</span>
                            )}
                            <span className="text-sm">
                                Created {format(new Date(brand.createdAt), 'MMM d, yyyy')}
                            </span>
                        </div>
                        {brain?.positioningStatement && (
                            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl italic">
                                &ldquo;{brain.positioningStatement}&rdquo;
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <Button variant="ghost" size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                        Re-analyze
                    </Button>
                    {brain && (
                        <Button variant="secondary" size="sm" onClick={handleRefine} disabled={isRefining}>
                            {isRefining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                            Refine
                        </Button>
                    )}
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm">
                        <Sparkles className="mr-2 h-4 w-4" /> Create Campaign
                    </Button>
                </div>
            </div>

            {/* ── Analyzing banner ───────────────────────────────────────────── */}
            {isAnalyzing && (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center gap-4 py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Building Brand Brain...</p>
                            <p className="text-xs text-muted-foreground">AI is analyzing your assets and context. This takes 30–90 seconds.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Tabs ───────────────────────────────────────────────────────── */}
            {brain ? (
                <Tabs defaultValue="strategy" className="space-y-4">
                    <TabsList className="flex-wrap h-auto gap-1">
                        <TabsTrigger value="strategy" className="gap-1.5 text-xs">
                            <Target className="h-3.5 w-3.5" /> Strategy
                        </TabsTrigger>
                        <TabsTrigger value="voice" className="gap-1.5 text-xs">
                            <Zap className="h-3.5 w-3.5" /> Voice
                        </TabsTrigger>
                        <TabsTrigger value="visual" className="gap-1.5 text-xs">
                            <ImageIcon className="h-3.5 w-3.5" /> Visual
                        </TabsTrigger>
                        <TabsTrigger value="audience" className="gap-1.5 text-xs">
                            <Users className="h-3.5 w-3.5" /> Audience
                        </TabsTrigger>
                        <TabsTrigger value="content" className="gap-1.5 text-xs">
                            <Layers className="h-3.5 w-3.5" /> Content Pillars
                        </TabsTrigger>
                        <TabsTrigger value="platforms" className="gap-1.5 text-xs">
                            <BarChart3 className="h-3.5 w-3.5" /> Platforms
                        </TabsTrigger>
                        <TabsTrigger value="assets" className="gap-1.5 text-xs">
                            <FileText className="h-3.5 w-3.5" /> Assets
                        </TabsTrigger>
                    </TabsList>

                    {/* ── STRATEGY ───────────────────────────────────────────── */}
                    <TabsContent value="strategy" className="space-y-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-primary" /> Brand Positioning
                                    </CardTitle>
                                    <CardDescription>The strategic foundation for all creative work</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {brain.positioningStatement && (
                                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Positioning Statement</p>
                                            <p className="text-sm leading-relaxed italic">&ldquo;{brain.positioningStatement}&rdquo;</p>
                                        </div>
                                    )}
                                    <InfoRow label="Market Category" value={brain.marketCategory} />
                                    <InfoRow label="Mission" value={brain.missionStatement} />
                                    {brain.brandPersonality?.length > 0 && (
                                        <Section title="Brand Personality">
                                            <TagList items={brain.brandPersonality} />
                                        </Section>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Brand Archetype</CardTitle>
                                    <CardDescription>Your brand&apos;s core character</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {brain.brandArchetype ? (
                                        <div className="text-center py-4">
                                            <div className="text-5xl mb-2">{ARCHETYPE_EMOJI[brain.brandArchetype] || '🎯'}</div>
                                            <p className="font-bold text-xl">{brain.brandArchetype}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic text-center py-4">Not determined</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Messaging Hierarchy */}
                        {brain.messagingHierarchy && Object.keys(brain.messagingHierarchy).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-primary" /> Messaging Hierarchy
                                    </CardTitle>
                                    <CardDescription>Priority order of messages across all communications</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {brain.messagingHierarchy.primaryMessage && (
                                        <div className="lg:col-span-3 rounded-lg bg-primary/5 border border-primary/20 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Primary Message</p>
                                            <p className="text-sm font-medium">{brain.messagingHierarchy.primaryMessage}</p>
                                        </div>
                                    )}
                                    {brain.messagingHierarchy.secondaryMessages?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Secondary Messages</p>
                                            <ul className="space-y-1.5">
                                                {brain.messagingHierarchy.secondaryMessages.map((m: string, i: number) => (
                                                    <li key={i} className="text-sm flex gap-2">
                                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" /> {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {brain.messagingHierarchy.emotionalBenefits?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Emotional Benefits</p>
                                            <ul className="space-y-1.5">
                                                {brain.messagingHierarchy.emotionalBenefits.map((b: string, i: number) => (
                                                    <li key={i} className="text-sm flex gap-2">
                                                        <span className="text-rose-400">♥</span> {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {brain.messagingHierarchy.rationalBenefits?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Rational Benefits</p>
                                            <ul className="space-y-1.5">
                                                {brain.messagingHierarchy.rationalBenefits.map((b: string, i: number) => (
                                                    <li key={i} className="text-sm flex gap-2">
                                                        <ChevronRight className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" /> {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {brain.messagingHierarchy.proofPoints?.length > 0 && (
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Proof Points</p>
                                            <div className="flex flex-wrap gap-2">
                                                {brain.messagingHierarchy.proofPoints.map((p: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Competitive Intelligence */}
                        {brain.competitorPositioning?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" /> Competitive Landscape
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y">
                                        {brain.competitorPositioning.map((comp: any, i: number) => (
                                            <div key={i} className="py-4 first:pt-0 last:pb-0 grid gap-3 md:grid-cols-4">
                                                <div>
                                                    <p className="font-semibold text-sm">{comp.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{comp.positioning}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-1">Strengths</p>
                                                    <ul className="space-y-0.5">
                                                        {comp.strengths?.map((s: string, j: number) => (
                                                            <li key={j} className="text-xs text-muted-foreground">• {s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Weaknesses</p>
                                                    <ul className="space-y-0.5">
                                                        {comp.weaknesses?.map((w: string, j: number) => (
                                                            <li key={j} className="text-xs text-muted-foreground">• {w}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                                                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Our Advantage</p>
                                                    <p className="text-xs">{comp.ourAdvantage}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── VOICE ──────────────────────────────────────────────── */}
                    <TabsContent value="voice" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-primary" /> Brand Voice
                                    </CardTitle>
                                    <CardDescription>How this brand sounds across every touchpoint</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {brain.voiceSummary && (
                                        <div className="rounded-lg bg-muted/50 p-4">
                                            <p className="text-sm leading-relaxed">{brain.voiceSummary}</p>
                                        </div>
                                    )}
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Section title="Tone Descriptors">
                                            <TagList items={brain.toneDescriptors} />
                                        </Section>
                                        <Section title="Sentence Style">
                                            <p className="text-sm">{brain.sentenceStyle || 'Not defined'}</p>
                                        </Section>
                                        <Section title="Vocabulary Level">
                                            <Badge variant="outline" className="capitalize">{brain.vocabularyLevel || 'Not defined'}</Badge>
                                        </Section>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>CTA Style</CardTitle>
                                    <CardDescription>How this brand drives action</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{brain.ctaStyle || 'Not defined'}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Banned Words</CardTitle>
                                    <CardDescription>Never use these in any creative</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {brain.bannedWords?.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {brain.bannedWords.map((w: string) => (
                                                <Badge key={w} variant="destructive" className="opacity-70">{w}</Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">None defined</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ── VISUAL ─────────────────────────────────────────────── */}
                    <TabsContent value="visual" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Color Palette</CardTitle>
                                    <CardDescription>Brand colors extracted from guidelines</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {brain.primaryColors?.length > 0 && (
                                        <Section title="Primary Colors">
                                            <div className="flex flex-wrap gap-3">
                                                {brain.primaryColors.map((c: string) => <ColorSwatch key={c} color={c} />)}
                                            </div>
                                        </Section>
                                    )}
                                    {brain.secondaryColors?.length > 0 && (
                                        <Section title="Secondary Colors">
                                            <div className="flex flex-wrap gap-3">
                                                {brain.secondaryColors.map((c: string) => <ColorSwatch key={c} color={c} />)}
                                            </div>
                                        </Section>
                                    )}
                                    {!brain.primaryColors?.length && !brain.secondaryColors?.length && (
                                        <p className="text-sm text-muted-foreground italic">No colors extracted</p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Visual Identity</CardTitle>
                                    <CardDescription>Style and composition guidelines</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <InfoRow label="Image Style" value={brain.imageStyle} />
                                    <InfoRow label="Typography" value={brain.typography} />
                                    <InfoRow label="Composition" value={brain.compositionNotes} />
                                    {brain.visualSummary && (
                                        <div className="rounded-lg bg-muted/50 p-3 mt-3">
                                            <p className="text-sm leading-relaxed text-muted-foreground">{brain.visualSummary}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ── AUDIENCE ───────────────────────────────────────────── */}
                    <TabsContent value="audience" className="space-y-4">
                        {brain.icpPersonas?.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {brain.icpPersonas.map((persona: any, i: number) => (
                                    <Card key={i} className="overflow-hidden">
                                        <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-transparent">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <CardTitle className="text-base">{persona.name}</CardTitle>
                                                    <CardDescription>{persona.title}</CardDescription>
                                                </div>
                                                {persona.ageRange && (
                                                    <Badge variant="outline" className="text-xs shrink-0">{persona.ageRange}</Badge>
                                                )}
                                            </div>
                                            {(persona.income || persona.location) && (
                                                <p className="text-xs text-muted-foreground">{[persona.income, persona.location].filter(Boolean).join(' · ')}</p>
                                            )}
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {persona.psychographics && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Psychographics</p>
                                                    <p className="text-sm text-muted-foreground">{persona.psychographics}</p>
                                                </div>
                                            )}
                                            {persona.painPoints?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-1">Pain Points</p>
                                                    <ul className="space-y-0.5">
                                                        {persona.painPoints.map((p: string, j: number) => (
                                                            <li key={j} className="text-xs flex gap-1.5">
                                                                <span className="text-red-400 shrink-0">•</span> {p}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {persona.goals?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-500 mb-1">Goals</p>
                                                    <ul className="space-y-0.5">
                                                        {persona.goals.map((g: string, j: number) => (
                                                            <li key={j} className="text-xs flex gap-1.5">
                                                                <span className="text-green-400 shrink-0">→</span> {g}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {persona.buyingTriggers?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-1">Buying Triggers</p>
                                                    <ul className="space-y-0.5">
                                                        {persona.buyingTriggers.map((t: string, j: number) => (
                                                            <li key={j} className="text-xs flex gap-1.5">
                                                                <span className="text-amber-400 shrink-0">⚡</span> {t}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {persona.objections?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Objections</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {persona.objections.map((o: string, j: number) => (
                                                            <Badge key={j} variant="outline" className="text-xs">{o}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {persona.preferredChannels?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Preferred Channels</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {persona.preferredChannels.map((c: string, j: number) => (
                                                            <Badge key={j} variant="secondary" className="text-xs">{c}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <Users className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p>No ICP personas extracted yet. Run brand analysis to build audience intelligence.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── CONTENT PILLARS ────────────────────────────────────── */}
                    <TabsContent value="content" className="space-y-4">
                        {brain.contentPillars?.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {brain.contentPillars.map((pillar: any, i: number) => {
                                    const colors = [
                                        'border-blue-500/30 bg-blue-500/5',
                                        'border-purple-500/30 bg-purple-500/5',
                                        'border-green-500/30 bg-green-500/5',
                                        'border-amber-500/30 bg-amber-500/5',
                                        'border-pink-500/30 bg-pink-500/5',
                                    ];
                                    const dotColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-pink-500'];
                                    return (
                                        <Card key={i} className={`border ${colors[i % colors.length]}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-3 w-3 rounded-full ${dotColors[i % dotColors.length]}`} />
                                                        <CardTitle className="text-sm">{pillar.name}</CardTitle>
                                                    </div>
                                                    {pillar.percentage && (
                                                        <Badge variant="outline" className="text-xs font-mono">{pillar.percentage}%</Badge>
                                                    )}
                                                </div>
                                                {pillar.description && (
                                                    <CardDescription className="text-xs mt-1">{pillar.description}</CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-3 pt-0">
                                                {pillar.topics?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Topics</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {pillar.topics.map((t: string, j: number) => (
                                                                <Badge key={j} variant="secondary" className="text-xs">{t}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {pillar.contentTypes?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Formats</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {pillar.contentTypes.map((t: string, j: number) => (
                                                                <Badge key={j} variant="outline" className="text-xs">{t}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {pillar.exampleHooks?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Example Hooks</p>
                                                        <ul className="space-y-1">
                                                            {pillar.exampleHooks.map((h: string, j: number) => (
                                                                <li key={j} className="text-xs text-muted-foreground italic">&ldquo;{h}&rdquo;</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <PieChart className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p>No content pillars defined yet. Run brand analysis to build your content strategy.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── PLATFORMS ──────────────────────────────────────────── */}
                    <TabsContent value="platforms" className="space-y-4">
                        {brain.platformPlaybooks && Object.keys(brain.platformPlaybooks).length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {Object.entries(brain.platformPlaybooks).map(([platform, playbook]: [string, any]) => {
                                    const config = PLATFORM_CONFIG[platform] || { label: platform, color: 'border-border bg-muted/30', emoji: '📱' };
                                    return (
                                        <Card key={platform} className={`border ${config.color}`}>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <span className="text-xl">{config.emoji}</span>
                                                    {config.label}
                                                </CardTitle>
                                                {playbook.toneNote && (
                                                    <CardDescription className="text-xs italic">&ldquo;{playbook.toneNote}&rdquo;</CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-0">
                                                {playbook.bestFormats?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Best Formats</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {playbook.bestFormats.map((f: string, j: number) => (
                                                                <Badge key={j} variant="secondary" className="text-xs">{f}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {playbook.contentMix && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Content Mix</p>
                                                        <p className="text-xs">{playbook.contentMix}</p>
                                                    </div>
                                                )}
                                                {playbook.subjectLineStyle && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Subject Line Style</p>
                                                        <p className="text-xs">{playbook.subjectLineStyle}</p>
                                                    </div>
                                                )}
                                                {playbook.keywordThemes?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Keyword Themes</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {playbook.keywordThemes.map((k: string, j: number) => (
                                                                <Badge key={j} variant="outline" className="text-xs">{k}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {playbook.winningHookTypes?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Winning Hook Types</p>
                                                        <ul className="space-y-1">
                                                            {playbook.winningHookTypes.map((h: string, j: number) => (
                                                                <li key={j} className="text-xs flex gap-1.5">
                                                                    <Zap className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" /> {h}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {(playbook.dos?.length > 0 || playbook.donts?.length > 0) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {playbook.dos?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-1">Do</p>
                                                                <ul className="space-y-0.5">
                                                                    {playbook.dos.map((d: string, j: number) => (
                                                                        <li key={j} className="text-xs text-muted-foreground">✓ {d}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {playbook.donts?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Don&apos;t</p>
                                                                <ul className="space-y-0.5">
                                                                    {playbook.donts.map((d: string, j: number) => (
                                                                        <li key={j} className="text-xs text-muted-foreground">✗ {d}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <BarChart3 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                    <p>No platform playbooks yet. Run brand analysis to build platform strategies.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── ASSETS ─────────────────────────────────────────────── */}
                    <TabsContent value="assets">
                        <Card>
                            <CardHeader>
                                <CardTitle>Brand Assets</CardTitle>
                                <CardDescription>Guidelines, logos, and product photos. Re-analyze after uploading new assets.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <AssetUploader brandId={brandId} onUploadComplete={() => {
                                    toast.success('Assets uploaded! Re-analyze to update Brand Brain.');
                                    fetchBrand();
                                }} />
                                {brand.assets?.length > 0 ? (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {brand.assets.map((asset: any) => (
                                            <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {asset.mimeType?.includes('pdf')
                                                        ? <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                                        : <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate max-w-[180px]">{asset.filename}</p>
                                                        <p className="text-xs text-muted-foreground">{(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={asset.url} target="_blank" rel="noopener noreferrer">View</a>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteAsset(asset.id)}
                                                        disabled={deletingAssetId === asset.id}
                                                        title="Delete asset"
                                                    >
                                                        {deletingAssetId === asset.id
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border-t">
                                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No assets uploaded yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                /* ── No Brain Yet ─────────────────────────────────────── */
                <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-dashed">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Brain className="h-8 w-8 text-primary/50" />
                    </div>
                    <CardTitle>Build Your Brand Brain</CardTitle>
                    <CardDescription className="mt-2 max-w-sm">
                        {isAnalyzing
                            ? 'Our AI is analyzing your assets and building comprehensive brand intelligence. This takes 30–90 seconds...'
                            : 'Upload brand guidelines or add a website, then analyze to build your Brand Brain — the intelligence that powers all campaigns.'}
                    </CardDescription>
                    {!isAnalyzing ? (
                        <Button onClick={handleAnalyze} className="mt-6">
                            <Sparkles className="mr-2 h-4 w-4" />
                            {brand.status === 'ONBOARDING' ? 'Retry Analysis' : 'Start Brand Analysis'}
                        </Button>
                    ) : (
                        <Button disabled className="mt-6">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Brand...
                        </Button>
                    )}
                </Card>
            )}

            {/* ── Performance Insights ──────────────────────────────────────── */}
            {brain?.winningPatterns && (
                <Card className="border-emerald-500/20 bg-emerald-950/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                            <CardTitle>Performance Intelligence</CardTitle>
                        </div>
                        <CardDescription>Winning patterns extracted from your best-performing creatives</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        {(brain.winningPatterns as any).winningHooks?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Top Hook Styles</h4>
                                <ul className="space-y-1">
                                    {(brain.winningPatterns as any).winningHooks.map((hook: string) => (
                                        <li key={hook} className="text-sm flex gap-2">
                                            <span className="text-emerald-500">•</span> {hook}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {(brain.winningPatterns as any).successfulAngles?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Best Angles</h4>
                                <ul className="space-y-1">
                                    {(brain.winningPatterns as any).successfulAngles.map((angle: string) => (
                                        <li key={angle} className="text-sm flex gap-2">
                                            <span className="text-emerald-500">•</span> {angle}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {(brain.winningPatterns as any).performanceInsight && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Insight</h4>
                                <p className="text-sm leading-relaxed text-muted-foreground italic">
                                    &ldquo;{(brain.winningPatterns as any).performanceInsight}&rdquo;
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
