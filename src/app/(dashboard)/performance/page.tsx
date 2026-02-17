import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, MousePointer2, BarChart3, Target, DollarSign, Database } from 'lucide-react';
import Image from 'next/image';
import { SeedButton } from '@/components/debug/SeedButton';

export default async function PerformancePage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const generations = await prisma.generation.findMany({
        where: { userId: session.user.id, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    const stats = generations.reduce((acc, gen) => {
        const data = (gen.performanceData as any) || {};
        acc.impressions += data.impressions || 0;
        acc.clicks += data.clicks || 0;
        acc.spend += data.spend || 0;
        acc.revenue += data.revenue || 0;
        acc.conversions += data.conversions || 0;
        return acc;
    }, { impressions: 0, clicks: 0, spend: 0, revenue: 0, conversions: 0 });

    const avgCtr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
    const totalRoas = stats.spend > 0 ? stats.revenue / stats.spend : 0;

    return (
        <div className="container max-w-7xl py-10 space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Intelligence</h1>
                    <p className="text-muted-foreground">Analyze which creative angles and visuals are driving the best results.</p>
                </div>
                <SeedButton />
            </div>

            {/* High Level Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgCtr.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground">Current average across all campaigns</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Blended ROAS</CardTitle>
                        <Target className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRoas.toFixed(2)}x</div>
                        <p className="text-xs text-muted-foreground">Return on ad spend</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.spend.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total advertising budget tracked</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/50 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversions}</div>
                        <p className="text-xs text-muted-foreground">Total successful actions tracked</p>
                    </CardContent>
                </Card>
            </div>

            {/* Creative Performance List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Top Performing Creatives</h2>
                <div className="grid gap-6">
                    {generations.map((gen) => {
                        const perf = (gen.performanceData as any) || {};
                        const ctr = perf.ctr ? (perf.ctr * 100).toFixed(2) : '0.00';
                        const roas = perf.roas ? perf.roas.toFixed(2) : '0.00';

                        return (
                            <Card key={gen.id} className="overflow-hidden bg-neutral-900/50 border-white/5">
                                <div className="md:flex h-full">
                                    <div className="w-full md:w-48 h-48 relative bg-neutral-800 shrink-0">
                                        {gen.type.startsWith('IMAGE') && gen.outputUrl ? (
                                            <Image
                                                src={gen.outputUrl}
                                                alt="Generated creative"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-neutral-500 font-mono text-xs p-4 overflow-hidden">
                                                {typeof gen.result === 'string' ? gen.result : JSON.stringify(gen.result).slice(0, 100)}...
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10">
                                                {gen.angle || 'General'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg line-clamp-1">
                                                    {gen.prompt.slice(0, 50)}...
                                                </h3>
                                                <p className="text-sm text-neutral-400 mt-1">
                                                    Generated on {new Date(gen.createdAt).toLocaleDateString()} • {gen.model}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-emerald-400 font-bold text-xl">{ctr}% CTR</div>
                                                <div className="text-neutral-500 text-xs">ROAS: {roas}x</div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center gap-8">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-xs text-neutral-400">
                                                    <span>Performance Score</span>
                                                    <span>{Math.min(100, (parseFloat(ctr) * 20)).toFixed(0)}/100</span>
                                                </div>
                                                <Progress value={Math.min(100, (parseFloat(ctr) * 20))} className="h-1.5" />
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold">${perf.spend || 0}</div>
                                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Spend</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold">{perf.clicks || 0}</div>
                                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Clicks</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold">{perf.conversions || 0}</div>
                                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Conv.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
