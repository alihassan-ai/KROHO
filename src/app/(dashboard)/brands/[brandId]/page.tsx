'use client';

export const dynamic = "force-dynamic";

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, ImageIcon, Settings, Globe, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { AssetUploader } from '@/components/brand/AssetUploader';
import { toast } from 'sonner';

export default function BrandDetailPage() {
    const params = useParams();
    const brandId = params.brandId as string;
    const [brand, setBrand] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    const handleRefine = async () => {
        setIsRefining(true);
        try {
            const response = await fetch(`/api/brands/${brandId}/refine`, {
                method: 'POST',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to refine brain');
            }
            toast.success('Brain refined with performance insights!');
            fetchBrand();
        } catch (error: any) {
            toast.error(error.message || 'Failed to refine brain');
            console.error(error);
        } finally {
            setIsRefining(false);
        }
    };

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

            if (data.status === 'ONBOARDING' && !pollRef.current) {
                // Poll every 8s while analysis is running
                pollRef.current = setInterval(fetchBrand, 8000);
            } else if (data.status !== 'ONBOARDING') {
                stopPolling();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrand();
        return stopPolling;
    }, [brandId]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(`/api/brands/${brandId}/analyze`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to start analysis');
            toast.success('Analysis started! This may take a minute.');
            fetchBrand();
        } catch (error) {
            toast.error('Failed to start analysis');
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!brand) {
        return <div>Brand not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                        {brand.name[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
                            <Badge variant={brand.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {brand.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                            <span className="flex items-center gap-1 text-sm">
                                <Globe className="h-3 w-3" />
                                {brand.website || 'No website'}
                            </span>
                            <span className="text-sm">
                                Created {format(new Date(brand.createdAt), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {brand.brain && (
                        <Button
                            variant="secondary"
                            onClick={handleRefine}
                            disabled={isRefining}
                        >
                            {isRefining ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4 text-emerald-400" />
                            )}
                            Refine Intelligence
                        </Button>
                    )}
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Brand
                    </Button>
                    <Button>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Playground
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="brain" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="brain" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Brand Brain
                    </TabsTrigger>
                    <TabsTrigger value="assets" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Assets
                    </TabsTrigger>
                    <TabsTrigger value="campaigns" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Campaigns
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="brain" className="space-y-4">
                    {brand.brain ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Voice Profile</CardTitle>
                                    <CardDescription>How the brand sounds to its audience.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Tone</p>
                                            <div className="flex flex-wrap gap-1">
                                                {brand.brain.toneDescriptors?.map((tone: string) => (
                                                    <Badge key={tone} variant="secondary">{tone}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Sentence Style</p>
                                            <p className="text-sm">{brand.brain.sentenceStyle || 'Not defined'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Voice Summary</p>
                                        <p className="text-sm leading-relaxed">{brand.brain.voiceSummary || 'No summary available.'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Visual DNA</CardTitle>
                                    <CardDescription>Primary brand colors and style.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Colors</p>
                                        <div className="flex gap-2">
                                            {brand.brain.primaryColors?.map((color: string) => (
                                                <div
                                                    key={color}
                                                    className="h-8 w-8 rounded border"
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Image Style</p>
                                        <p className="text-sm">{brand.brain.imageStyle || 'Not defined'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Performance Intelligence Card */}
                            {brand.brain.winningPatterns && (
                                <Card className="col-span-full bg-emerald-950/20 border-emerald-500/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-emerald-400" />
                                            <CardTitle>Performance Insights (AI Refined)</CardTitle>
                                        </div>
                                        <CardDescription>Winning patterns extracted from your best performing creatives.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Top Hook Styles</h4>
                                            <ul className="space-y-1">
                                                {(brand.brain.winningPatterns as any).winningHooks?.map((hook: string) => (
                                                    <li key={hook} className="text-sm flex gap-2">
                                                        <span className="text-emerald-500">•</span> {hook}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Successful Angles</h4>
                                            <ul className="space-y-1">
                                                {(brand.brain.winningPatterns as any).successfulAngles?.map((angle: string) => (
                                                    <li key={angle} className="text-sm flex gap-2">
                                                        <span className="text-emerald-500">•</span> {angle}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Analysis</h4>
                                            <p className="text-sm leading-relaxed text-muted-foreground italic">
                                                "{(brand.brain.winningPatterns as any).performanceInsight}"
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
                            <Sparkles className="h-10 w-10 text-muted-foreground mb-4" />
                            <CardTitle>Build Your Brand Brain</CardTitle>
                            <CardDescription className="mt-2 max-w-sm">
                                {brand.status === 'ONBOARDING'
                                    ? 'Our AI is currently analyzing your assets. This usually takes 30-60 second.'
                                    : 'Upload guidelines and assets to help our AI build a profile of your brand voice and visual style.'}
                            </CardDescription>
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || brand.status === 'ONBOARDING' || brand.assets?.length === 0}
                                className="mt-6"
                            >
                                {isAnalyzing || brand.status === 'ONBOARDING' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Brand...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Start Brand Analysis
                                    </>
                                )}
                            </Button>
                            {brand.assets?.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Upload at least one asset to start analysis.
                                </p>
                            )}
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="assets">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Brand Assets</CardTitle>
                                <CardDescription>Guidelines, logos, and product photos.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AssetUploader brandId={brandId} onUploadComplete={() => {
                                toast.success('Assets list refreshed');
                            }} />

                            {brand.assets?.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {brand.assets.map((asset: any) => (
                                        <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                {asset.mimeType.includes('pdf') ? <FileText className="h-5 w-5 text-red-500" /> : <ImageIcon className="h-5 w-5 text-blue-500" />}
                                                <div>
                                                    <p className="text-sm font-medium truncate max-w-[200px]">{asset.filename}</p>
                                                    <p className="text-xs text-muted-foreground">{(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={asset.url} target="_blank" rel="noopener noreferrer">View</a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border-t">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No assets uploaded yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="campaigns">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Campaigns</CardTitle>
                            <CardDescription>Marketing campaigns for this brand.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No campaigns found.</p>
                                <Button variant="link">Create a campaign</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { Briefcase } from "lucide-react";
