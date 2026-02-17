import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/stripe';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, plan: true, createdAt: true },
  });
  if (!user) redirect('/login');

  const plan = PLANS[user.plan as keyof typeof PLANS] ?? PLANS.STARTER;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and workspace.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1 border-b">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user.name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{user.createdAt.toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" /> Subscription
          </CardTitle>
          <CardDescription>Your current plan and limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{plan.name} Plan</span>
                <Badge variant="secondary">{user.plan}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plan.brands} brands · {plan.limit === Infinity ? 'Unlimited' : plan.limit} generations/month
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href="/settings/billing">
                <ExternalLink className="h-3.5 w-3.5" /> Manage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-1.5">
          <Link href="/settings/billing">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">Billing</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-1.5">
          <Link href="/settings/team">
            <Users className="h-5 w-5" />
            <span className="text-sm">Team</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
