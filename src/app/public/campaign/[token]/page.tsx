import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default async function PublicCampaignPage({
    params
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params;

    const campaign = await prisma.campaign.findFirst({
        where: {
            shareToken: token,
            isShared: true
        },
        include: {
            brand: {
                include: {
                    brain: true
                }
            },
            generations: {
                where: { status: 'COMPLETED' },
                orderBy: { createdAt: 'desc' }
            }
        }
    }) as any;

    if (!campaign) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col">
            <div className="max-w-7xl mx-auto w-full space-y-12 flex-1">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter uppercase">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        KROHO
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-xl bg-indigo-600 flex items-center justify-center text-3xl font-bold uppercase">
                            {campaign.brand.name[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black tracking-tight uppercase">{campaign.name}</h1>
                                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 px-3 uppercase text-[10px] font-bold tracking-widest">
                                    Client Preview
                                </Badge>
                            </div>
                            <p className="text-neutral-500 font-medium tracking-wide">Created for <span className="text-indigo-400">{campaign.brand.name}</span></p>
                        </div>
                    </div>
                </header>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaign.generations.map((gen: any) => (
                        <Card key={gen.id} className="bg-neutral-900/50 border-white/5 overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
                            {gen.type === 'IMAGE_CONCEPT' && (gen.result as any)?.url ? (
                                <div className="aspect-square relative overflow-hidden">
                                    <Image
                                        src={(gen.result as any).url}
                                        alt="Creative Concept"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ) : null}
                            <CardHeader className="p-6">
                                <Badge variant="outline" className="w-fit mb-3 text-[10px] uppercase font-bold tracking-tighter border-white/10">
                                    {gen.type.replace('_', ' ')}
                                </Badge>
                                <CardTitle className="text-lg leading-snug">
                                    {gen.type.includes('COPY') ? (
                                        <div className="space-y-4">
                                            {Array.isArray(gen.result) ? (
                                                gen.result.map((concept: any, idx: number) => (
                                                    <div key={idx} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                                        <p className="text-indigo-400 font-bold text-sm mb-1 uppercase tracking-widest">{concept.hook || 'Headline'}</p>
                                                        <p className="text-neutral-200 leading-relaxed font-medium">{concept.body || concept.primaryText}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>{JSON.stringify(gen.result)}</p>
                                            )}
                                        </div>
                                    ) : (
                                        'Visual Concept'
                                    )}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="pt-20 border-t border-white/5 text-center mt-auto">
                <p className="text-neutral-600 text-sm font-medium tracking-wide">
                    Generated by <span className="text-indigo-500 font-bold uppercase">KROHO</span> — Creative Production at Machine Speed.
                </p>
            </footer>
        </div>
    );
}
