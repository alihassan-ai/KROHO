import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban } from 'lucide-react';
import { CampaignBriefForm } from '@/components/campaign/CampaignBriefForm';

export default function NewCampaignPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Campaign</h1>
        <p className="text-muted-foreground mt-1">Define your campaign brief to guide AI generation.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderKanban className="h-4 w-4 text-primary" /> Campaign Brief
          </CardTitle>
          <CardDescription>
            Set your objective, target platforms, and creative formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignBriefForm />
        </CardContent>
      </Card>
    </div>
  );
}
