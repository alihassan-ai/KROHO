import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { extractWinningPatterns } from '@/services/brand-brain/winning-patterns';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ brandId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { brandId } = await context.params;

    try {
        const result = await extractWinningPatterns(brandId);
        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error('Refine brain error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
