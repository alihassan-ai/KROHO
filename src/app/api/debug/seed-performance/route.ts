import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { seedMockPerformanceData } from '@/lib/mock-performance';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await seedMockPerformanceData(session.user.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Seed error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
