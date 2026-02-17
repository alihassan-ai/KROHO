import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const logSchema = z.object({
    generationId: z.string(),
    impressions: z.number().min(0).default(0),
    clicks: z.number().min(0).default(0),
    spend: z.number().min(0).default(0),
    conversions: z.number().min(0).default(0),
    revenue: z.number().min(0).default(0),
    date: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = logSchema.parse(body);

        // Verify ownership/workspace access
        const generation = await prisma.generation.findUnique({
            where: { id: validatedData.generationId },
            include: { brand: true },
        });

        if (!generation) {
            return new NextResponse('Generation not found', { status: 404 });
        }

        // Create log entry
        const log = await prisma.performanceLog.create({
            data: {
                generationId: validatedData.generationId,
                impressions: validatedData.impressions,
                clicks: validatedData.clicks,
                spend: validatedData.spend,
                conversions: validatedData.conversions,
                revenue: validatedData.revenue,
                date: validatedData.date ? new Date(validatedData.date) : new Date(),
            },
        });

        // Update cached aggregate on generation
        const logs = await prisma.performanceLog.findMany({
            where: { generationId: validatedData.generationId },
        });

        const totalImpressions = logs.reduce((sum, l) => sum + l.impressions, 0);
        const totalClicks = logs.reduce((sum, l) => sum + l.clicks, 0);
        const totalSpend = logs.reduce((sum, l) => sum + l.spend, 0);
        const totalConversions = logs.reduce((sum, l) => sum + l.conversions, 0);
        const totalRevenue = logs.reduce((sum, l) => sum + l.revenue, 0);

        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
        const roas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;
        const cpa = totalConversions > 0 ? (totalSpend / totalConversions) : 0;

        await prisma.generation.update({
            where: { id: validatedData.generationId },
            data: {
                performanceData: {
                    impressions: totalImpressions,
                    clicks: totalClicks,
                    spend: totalSpend,
                    conversions: totalConversions,
                    revenue: totalRevenue,
                    ctr,
                    roas,
                    cpa,
                },
            },
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error('Performance log error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(error.issues, { status: 400 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
