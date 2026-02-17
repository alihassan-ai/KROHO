import prisma from '@/lib/prisma';
import { PLANS } from '@/lib/stripe';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function checkPlanLimits(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            plan: true,
        },
    });

    if (!user) throw new Error('User not found');

    const plan = PLANS[user.plan as keyof typeof PLANS] || PLANS.STARTER;

    // If plan is Scale (unlimited), bypass check
    if (plan.limit === Infinity) return { allowed: true, current: 0, limit: Infinity };

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const count = await prisma.generation.count({
        where: {
            userId,
            createdAt: {
                gte: start,
                lte: end,
            },
        },
    });

    return {
        allowed: count < plan.limit,
        current: count,
        limit: plan.limit,
    };
}
