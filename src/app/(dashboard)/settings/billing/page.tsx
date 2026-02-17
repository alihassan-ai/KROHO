import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PLANS } from '@/lib/stripe';
import { checkPlanLimits } from '@/lib/usage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Zap, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    }) as any;

    if (!user) return null;

    const usage = await checkPlanLimits(session.user.id);
    const plan = PLANS[user.plan as keyof typeof PLANS] || PLANS.STARTER;
    const usagePercentage = plan.limit === Infinity ? 0 : (usage.current / usage.limit) * 100;

    return (
        <div className="container max-w-5xl py-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your plan and view your usage statistics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan Card */}
                <Card className="border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Current Plan</CardTitle>
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                {plan.name}
                            </Badge>
                        </div>
                        <CardDescription>You are currently on the {plan.name} tier.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Generations this month</span>
                                <span className="font-medium">{usage.current} / {plan.limit === Infinity ? '∞' : plan.limit}</span>
                            </div>
                            <Progress value={usagePercentage} className="h-2" />
                        </div>

                        {user.currentPeriodEnd && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span>Next billing date: {format(user.currentPeriodEnd, 'PPP')}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t flex gap-3">
                        {user.stripeId ? (
                            <Button className="w-full gap-2">
                                <Zap className="h-4 w-4" />
                                Manage in Stripe
                            </Button>
                        ) : (
                            <Button className="w-full gap-2" asChild>
                                <Link href="/signup">
                                    <Zap className="h-4 w-4" />
                                    Upgrade Plan
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Plan Highlights */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Features</CardTitle>
                        <CardDescription>Included in your {plan.name} subscription.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            `${plan.brands} Brand Workspaces`,
                            `${plan.limit === Infinity ? 'Unlimited' : plan.limit} AD Generations`,
                            "Standard Export Packager",
                            "Community Support"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-emerald-500" />
                                {feature}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Pricing Comparison for Upgrades */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Available Plans</h2>
                    <p className="text-muted-foreground">Choose the plan that best fits your agency's needs.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {Object.values(PLANS).map((p) => (
                        <Card key={p.id} className={p.id === plan.id.toLowerCase() ? "border-indigo-500 shadow-md" : ""}>
                            <CardHeader>
                                <CardTitle className="text-lg">{p.name}</CardTitle>
                                <CardDescription>{p.limit === Infinity ? 'Unlimited' : p.limit} gens / mo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-4">
                                    {p.id === 'starter' ? '$99' : p.id === 'growth' ? '$199' : '$349'}
                                    <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                                </div>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-3 w-3" /> {p.brands} Brands
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-3 w-3" /> Resize Packager
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant={p.id === plan.id.toLowerCase() ? "secondary" : "outline"}
                                    className="w-full"
                                    disabled={p.id === plan.id.toLowerCase()}
                                >
                                    {p.id === plan.id.toLowerCase() ? "Current Plan" : "Switch Plan"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
