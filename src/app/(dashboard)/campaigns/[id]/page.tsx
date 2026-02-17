'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft,
    Download,
    ExternalLink,
    FileText,
    LayoutGrid,
    Settings,
    Loader2,
    Calendar,
    Target,
    Layers,
    Type,
    ImageIcon,
    Copy,
    Check,
    RefreshCw,
    DownloadCloud,
    Share2,
    Globe,
    Link as LinkIcon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CampaignWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [exportFormat, setExportFormat] = useState('zip');
    const [isShared, setIsShared] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await fetch(`/api/campaigns/${id}`);
                const data = await res.json();
                setCampaign(data);
                setIsShared(data.isShared || false);
                if (data.isShared && data.shareToken) {
                    setShareUrl(`${window.location.origin}/public/campaign/${data.shareToken}`);
                }
            } catch (error) {
                console.error('Failed to fetch campaign', error);
                toast.error('Failed to load campaign');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    const handleToggleSharing = async (enabled: boolean) => {
        setIsSharing(true);
        try {
            const res = await fetch(`/api/campaigns/${id}/share`, {
                method: 'POST',
                body: JSON.stringify({ isShared: enabled }),
            });
            const data = await res.json();
            setIsShared(data.isShared);
            setShareUrl(data.shareUrl);
            toast.success(enabled ? 'Public sharing enabled' : 'Public sharing disabled');
        } catch (error) {
            toast.error('Failed to update sharing settings');
        } finally {
            setIsSharing(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success('Copied to clipboard');
    };

    const handleExport = (cid: string) => {
        window.open(`/api/campaigns/${cid}/export?format=${exportFormat}`, '_blank');
        toast.success(`Starting ${exportFormat.toUpperCase()} export...`);
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Campaign not found</h2>
                <Link href="/campaigns">
                    <Button variant="link">Back to Campaigns</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
                <div className="space-y-1">
                    <Link href="/campaigns" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                        Back to Campaigns
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {campaign.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Created on {format(new Date(campaign.createdAt), 'MMMM d, yyyy')} • {campaign.brand.name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share Campaign</DialogTitle>
                                <DialogDescription>
                                    Create a public link to share these creative concepts with clients.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <Globe className={cn("h-5 w-5", isShared ? "text-emerald-500" : "text-muted-foreground")} />
                                        <div>
                                            <p className="text-sm font-medium">Public Access</p>
                                            <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant={isShared ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => handleToggleSharing(!isShared)}
                                        disabled={isSharing}
                                    >
                                        {isSharing && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                        {isShared ? "Disable" : "Enable"}
                                    </Button>
                                </div>

                                {isShared && shareUrl && (
                                    <div className="space-y-2">
                                        <Label>Share Link</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-muted p-2 rounded border text-xs font-mono truncate">
                                                {shareUrl}
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-9 w-9"
                                                onClick={() => copyToClipboard(shareUrl, 'share')}
                                            >
                                                {copiedId === 'share' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9"
                                                asChild
                                            >
                                                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) || isShared && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Link href={`/playground?campaignId=${campaign.id}&brandId=${campaign.brandId}`}>
                        <Button variant="outline" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Open in Playground
                        </Button>
                    </Link>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <DownloadCloud className="h-4 w-4" />
                                Export Campaign
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Export Creative Package</DialogTitle>
                                <DialogDescription>
                                    Select your delivery format and target platforms.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Export Format</Label>
                                    <Select defaultValue="zip" onValueChange={setExportFormat}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="zip">ZIP (Images + Resizes + Copy)</SelectItem>
                                            <SelectItem value="markdown">Markdown (Copy Only)</SelectItem>
                                            <SelectItem value="json">JSON (Data Only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Platforms to include</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Meta', 'TikTok', 'Google'].map(p => (
                                            <Badge
                                                key={p}
                                                variant={campaign.platforms.includes(p.toLowerCase()) ? "default" : "outline"}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Platforms are determined by your campaign brief settings.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button className="w-full" onClick={() => handleExport(campaign.id)}>
                                    Generate & Download
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="creatives" className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList>
                        <TabsTrigger value="creatives" className="gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Creatives
                        </TabsTrigger>
                        <TabsTrigger value="brief" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Campaign Brief
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-7 px-2 font-mono text-[10px]">
                            {campaign.generations?.length || 0} ASSETS
                        </Badge>
                    </div>
                </div>

                <TabsContent value="creatives" className="mt-0 space-y-8">
                    {/* Copy Assets */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Type className="h-5 w-5 text-primary" />
                                Approved Copy
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaign.generations?.filter((g: any) => g.type === 'COPY_BODY').map((gen: any) => (
                                <Card key={gen.id} className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all">
                                    <CardHeader className="bg-muted/30 py-3 flex flex-row items-center justify-between space-y-0">
                                        <Badge variant="outline" className="text-[10px] h-5 bg-background capitalize">
                                            {gen.parameters?.format?.replace('_', ' ') || 'Stat Ad'}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(JSON.stringify(gen.result), gen.id)}>
                                            {copiedId === gen.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold leading-tight">{gen.result?.[0]?.headline || 'Headline'}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                                                {gen.result?.[0]?.body || 'Body text...'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {campaign.generations?.filter((g: any) => g.type === 'COPY_BODY').length === 0 && (
                                <Card className="bg-muted/10 border-dashed aspect-[3/1] flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-sm text-muted-foreground">No approved copy yet.</p>
                                    <Link href={`/playground?campaignId=${campaign.id}&brandId=${campaign.brandId}&mode=copy`}>
                                        <Button variant="link" size="sm">Go to Playground</Button>
                                    </Link>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Image Assets */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" />
                                Concept Visuals
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {campaign.generations?.filter((g: any) => g.type === 'IMAGE_CONCEPT').map((gen: any) => (
                                <Card key={gen.id} className="group overflow-hidden border-primary/10 hover:border-primary/30 transition-all shadow-sm">
                                    <div className="aspect-square relative bg-muted/20">
                                        {gen.status === 'COMPLETED' ? (
                                            <>
                                                <img
                                                    src={gen.result?.startsWith('http') ? gen.result : `data:image/png;base64,${gen.result}`}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                                    alt="Generated concept"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground font-medium">Processing...</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t truncate text-[10px] text-muted-foreground italic">
                                        "{gen.prompt}"
                                    </div>
                                </Card>
                            ))}
                            {campaign.generations?.filter((g: any) => g.type === 'IMAGE_CONCEPT').length === 0 && (
                                <Card className="bg-muted/10 border-dashed aspect-square flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-sm text-muted-foreground">No visuals yet.</p>
                                    <Link href={`/playground?campaignId=${campaign.id}&brandId=${campaign.brandId}&mode=image`}>
                                        <Button variant="link" size="sm">Go to Playground</Button>
                                    </Link>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="brief">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Card */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campaign Brief</CardTitle>
                                    <CardDescription>The core strategy and objectives for this marketing initiative.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Objective</Label>
                                            <p className="text-sm border rounded-md p-2 bg-muted/20 capitalize">{campaign.objective || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Platforms</Label>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {campaign.platforms?.map((p: string) => (
                                                    <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
                                                )) || <span className="text-sm text-muted-foreground">None</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Formats</Label>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {campaign.formats?.map((f: string) => (
                                                <Badge key={f} variant="outline" className="capitalize">{f.replace('_', ' ')}</Badge>
                                            )) || <span className="text-sm text-muted-foreground">None</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Special Instructions</Label>
                                        <div className="text-sm border rounded-md p-3 bg-muted/5 min-h-[100px] whitespace-pre-wrap">
                                            {campaign.instructions || 'No detailed instructions provided.'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Brand Intelligence</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                        <p className="text-xs font-bold text-primary mb-1">Target Persona</p>
                                        <p className="text-sm line-clamp-2 italic">Based on Brand Brain analysis of {campaign.brand.name} guidelines.</p>
                                    </div>
                                    <Button variant="outline" className="w-full text-xs h-8">View Guidelines</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Campaign Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>Campaign Name</Label>
                                <Input value={campaign.name} readOnly />
                            </div>
                            <Button variant="destructive" size="sm">Delete Campaign</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
