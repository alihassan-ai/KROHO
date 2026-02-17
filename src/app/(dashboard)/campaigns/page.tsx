'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Download,
    FolderKanban,
    ExternalLink,
    Calendar,
    Briefcase,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('/api/campaigns');
                const data = await res.json();
                setCampaigns(data);
            } catch (error) {
                console.error('Failed to fetch campaigns', error);
                toast.error('Failed to load campaigns');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const handleExport = (id: string, name: string) => {
        window.open(`/api/campaigns/${id}/export?format=markdown`, '_blank');
        toast.info(`Exporting ${name}...`);
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your creative campaigns and export finalized assets.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                </Button>
            </div>

            {campaigns.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/30 border-dashed">
                    <FolderKanban className="h-10 w-10 text-muted-foreground mb-4" />
                    <CardTitle>No Campaigns Yet</CardTitle>
                    <CardDescription className="mt-2 max-w-sm">
                        Create a campaign to start grouping your ad generations for export.
                    </CardDescription>
                    <Button variant="outline" className="mt-6">Create your first campaign</Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="group hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'} className={cn(
                                        campaign.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : '',
                                        campaign.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : ''
                                    )}>
                                        {campaign.status}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <Link href={`/campaigns/${campaign.id}`}>
                                    <CardTitle className="group-hover:text-primary transition-colors cursor-pointer">
                                        {campaign.name}
                                    </CardTitle>
                                </Link>
                                <CardDescription className="flex items-center gap-1 py-1">
                                    <Briefcase className="h-3.3" />
                                    {campaign.brand.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" className="w-full justify-between group/btn" onClick={(e) => { e.stopPropagation(); handleExport(campaign.id, campaign.name); }}>
                                        <div className="flex items-center">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Assets
                                        </div>
                                        <Badge variant="ghost" className="text-[10px] group-hover/btn:bg-primary/10">.MD</Badge>
                                    </Button>
                                    <Link href={`/campaigns/${campaign.id}`} className="w-full">
                                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            View Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
