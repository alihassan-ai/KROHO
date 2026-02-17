'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Download, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Campaign, CampaignStatus } from '@/types/campaign';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; class: string }> = {
  DRAFT:     { label: 'Draft',     class: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  ACTIVE:    { label: 'Active',    class: 'bg-green-500/10 text-green-600 border-green-200' },
  COMPLETED: { label: 'Completed', class: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  ARCHIVED:  { label: 'Archived',  class: 'bg-muted text-muted-foreground' },
};

interface CampaignCardProps {
  campaign: Campaign;
  onExport?: (id: string, name: string) => void;
}

export function CampaignCard({ campaign, onExport }: CampaignCardProps) {
  const statusCfg = STATUS_CONFIG[campaign.status];

  return (
    <Card className="hover:border-primary/40 transition-all hover:shadow-md group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{campaign.name}</CardTitle>
            {campaign.brand && (
              <p className="text-xs text-muted-foreground">{campaign.brand.name}</p>
            )}
          </div>
          <Badge className={cn('text-[10px] px-2 border', statusCfg.class)}>
            {statusCfg.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaign.objective && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="capitalize">{campaign.objective}</span>
          </div>
        )}
        {campaign.platforms?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {campaign.platforms.map((p) => (
              <Badge key={p} variant="outline" className="text-[10px] capitalize">{p}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
        </div>
        <div className="flex gap-2 pt-1">
          <Button asChild variant="secondary" size="sm" className="flex-1 gap-1.5 text-xs h-8">
            <Link href={`/campaigns/${campaign.id}`}>
              <ExternalLink className="h-3.5 w-3.5" /> View
            </Link>
          </Button>
          {onExport && (
            <Button
              variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8"
              onClick={() => onExport(campaign.id, campaign.name)}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
