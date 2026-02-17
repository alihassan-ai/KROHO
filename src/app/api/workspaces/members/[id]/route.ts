import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateMemberSchema = z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const { id: membershipId } = await context.params;

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();
        const { role } = updateMemberSchema.parse(body);

        // Verify that the editor is the owner of the workspace or an ADMIN
        const membership = await prisma.workspaceMember.findUnique({
            where: { id: membershipId },
            include: { workspace: true }
        });

        if (!membership) {
            return new NextResponse('Membership not found', { status: 404 });
        }

        const isOwner = membership.workspace.ownerId === session.user.id;
        const currentUserMembership = await prisma.workspaceMember.findFirst({
            where: {
                workspaceId: membership.workspaceId,
                userId: session.user.id,
                role: 'ADMIN'
            }
        });

        if (!isOwner && !currentUserMembership) {
            return new NextResponse('Forbidden: Only owners or admins can manage members', { status: 403 });
        }

        const updated = await prisma.workspaceMember.update({
            where: { id: membershipId },
            data: { role }
        });

        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(error.issues, { status: 400 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const { id: membershipId } = await context.params;

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const membership = await prisma.workspaceMember.findUnique({
            where: { id: membershipId },
            include: { workspace: true }
        });

        if (!membership) {
            return new NextResponse('Membership not found', { status: 404 });
        }

        const isOwner = membership.workspace.ownerId === session.user.id;
        const currentUserMembership = await prisma.workspaceMember.findFirst({
            where: {
                workspaceId: membership.workspaceId,
                userId: session.user.id,
                role: 'ADMIN'
            }
        });

        // Prevention: Cannot remove owner
        if (membership.userId === membership.workspace.ownerId) {
            return new NextResponse('Forbidden: Cannot remove workspace owner', { status: 403 });
        }

        if (!isOwner && !currentUserMembership && membership.userId !== session.user.id) {
            return new NextResponse('Forbidden: Permission denied', { status: 403 });
        }

        await prisma.workspaceMember.delete({
            where: { id: membershipId }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
