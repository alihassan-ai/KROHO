import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, FolderKanban, BarChart3, Briefcase, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;

    // Fetch metrics
    const [brandCount, campaignCount, generationCount, recentGenerations, topBrands] = await Promise.all([
        prisma.brand.count({ where: { userId } }),
        prisma.campaign.count({ where: { userId } }),
        prisma.generation.count({ where: { userId } }),
        prisma.generation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { brand: true, campaign: true }
        }),
        prisma.brand.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { generations: true }
                }
            },
            orderBy: {
                generations: {
                    _count: 'desc'
                }
            },
            take: 5
        })
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Link href="/campaigns/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Campaign
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{brandCount}</div>
                        <p className="text-xs text-muted-foreground">Across all workspaces</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{generationCount}</div>
                        <p className="text-xs text-muted-foreground">AI copy & images</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaignCount}</div>
                        <p className="text-xs text-muted-foreground">Active & completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Awaiting data...</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentGenerations.length > 0 ? (
                                recentGenerations.map((gen) => (
                                    <div key={gen.id} className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                Generated {gen.type.toLowerCase().replace('_', ' ')} for {gen.brand?.name || 'Unknown Brand'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(gen.createdAt))} ago
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Clock className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-sm text-muted-foreground">No recent activity found.</p>
                                    <Link href="/playground" className="mt-4">
                                        <Button variant="outline" size="sm">Go to Playground</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Brands</CardTitle>
                        <CardDescription>Most active creative channels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topBrands.length > 0 ? (
                                topBrands.map((brand) => (
                                    <div key={brand.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold uppercase">
                                                {brand.name[0]}
                                            </div>
                                            <span className="text-sm font-medium">{brand.name}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{brand._count.generations} gens</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Briefcase className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-sm text-muted-foreground">Connect a brand to see stats.</p>
                                    <Link href="/brands/new" className="mt-4">
                                        <Button variant="outline" size="sm">Setup Brand</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
