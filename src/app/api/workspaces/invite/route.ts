import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const inviteSchema = z.object({
    email: z.string().email(),
    workspaceId: z.string(),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, workspaceId, role } = inviteSchema.parse(body);

        // 1. Verify workspace ownership
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!workspace || workspace.ownerId !== session.user.id) {
            return new NextResponse('Forbidden: Only workspace owners can invite members', { status: 403 });
        }

        // 2. Find or invite user (simulated)
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // In a real app, we would send an invite email
            // For this MVP, we require the user to already exist
            return NextResponse.json({
                error: 'User not found. For this prototype, users must already have an account.'
            }, { status: 404 });
        }

        // 3. Add to workspace
        const membership = await prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId: user.id,
                role,
            },
        });

        return NextResponse.json(membership);
    } catch (error) {
        console.error('Invite error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(error.issues, { status: 400 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
