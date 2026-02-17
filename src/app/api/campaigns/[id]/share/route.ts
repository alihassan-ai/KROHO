import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const { id } = await context.params;

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { isShared } = body;

        // Verify access (owner or workspace admin)
        const campaign = await prisma.campaign.findFirst({
            where: {
                id,
                OR: [
                    { userId: session.user.id },
                    {
                        brand: {
                            workspace: {
                                OR: [
                                    { ownerId: session.user.id },
                                    { members: { some: { userId: session.user.id, role: 'ADMIN' } } }
                                ]
                            }
                        }
                    }
                ]
            }
        });

        if (!campaign) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Generate token if enabling sharing and no token exists
        let shareToken = campaign.shareToken;
        if (isShared && !shareToken) {
            shareToken = require('crypto').randomBytes(32).toString('hex');
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: {
                isShared,
                shareToken: isShared ? shareToken : campaign.shareToken,
            }
        });

        return NextResponse.json({
            isShared: updatedCampaign.isShared,
            shareUrl: isShared ? `${process.env.NEXTAUTH_URL}/public/campaign/${shareToken}` : null
        });
    } catch (error) {
        console.error('Sharing error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
