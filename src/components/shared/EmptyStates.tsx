import { type LucideIcon, Sparkles, FolderKanban, ImageIcon, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ icon: Icon = Sparkles, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-5">
        <Icon className="h-8 w-8 text-muted-foreground opacity-40" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm mt-1.5">{description}</p>
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Button asChild size="sm">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoBrandsEmpty() {
  return (
    <EmptyState
      icon={Sparkles}
      title="No brands yet"
      description="Create your first brand to start generating AI-powered creatives."
      action={{ label: 'Create Brand', href: '/brands/new' }}
    />
  );
}

export function NoCampaignsEmpty() {
  return (
    <EmptyState
      icon={FolderKanban}
      title="No campaigns yet"
      description="Create a campaign to organize your creative generations."
      action={{ label: 'New Campaign', href: '/campaigns' }}
    />
  );
}

export function NoGenerationsEmpty() {
  return (
    <EmptyState
      icon={ImageIcon}
      title="Nothing generated yet"
      description="Use the playground to generate copy and images for your brand."
      action={{ label: 'Open Playground', href: '/playground' }}
    />
  );
}

export function NoExportsEmpty() {
  return (
    <EmptyState
      icon={Package}
      title="No exports yet"
      description="Generate creatives and export them as platform-ready ZIP packages."
      action={{ label: 'Open Playground', href: '/playground' }}
    />
  );
}
