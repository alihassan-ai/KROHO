import prisma from '@/lib/prisma';

export async function seedMockPerformanceData(userId: string) {
    const generations = await prisma.generation.findMany({
        where: { userId, status: 'COMPLETED' },
    });

    console.log(`Seeding mock performance data for ${generations.length} generations...`);

    for (const gen of generations) {
        // Generate random data
        const impressions = Math.floor(Math.random() * 5000) + 1000;
        const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
        const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02)); // 2-12% CVR
        const spend = Math.floor(Math.random() * 500) + 50;
        const revenue = conversions * (Math.floor(Math.random() * 50) + 20);

        const ctr = impressions > 0 ? clicks / impressions : 0;
        const roas = spend > 0 ? revenue / spend : 0;
        const cpa = conversions > 0 ? spend / conversions : 0;

        // Create a log entry
        await prisma.performanceLog.create({
            data: {
                generationId: gen.id,
                date: new Date(),
                impressions,
                clicks,
                spend,
                conversions,
                revenue,
            },
        });

        // Update cached data
        await prisma.generation.update({
            where: { id: gen.id },
            data: {
                performanceData: {
                    impressions,
                    clicks,
                    spend,
                    conversions,
                    revenue,
                    ctr,
                    roas,
                    cpa,
                },
            },
        });
    }

    console.log('Seeding complete.');
}
