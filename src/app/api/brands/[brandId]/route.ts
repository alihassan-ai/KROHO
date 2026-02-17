import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const session = await auth();
    const { brandId } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const brand = await prisma.brand.findFirst({
        where: {
            id: brandId,
            OR: [
                { userId: session.user.id },
                {
                    workspace: {
                        members: {
                            some: { userId: session.user.id }
                        }
                    }
                }
            ]
        },
        include: {
            brain: true,
            assets: true,
        },
    });

    if (!brand) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(brand);
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const session = await auth();
    const { brandId } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, website, status } = body;

    // Check access first
    const brand = await prisma.brand.findFirst({
        where: {
            id: brandId,
            OR: [
                { userId: session.user.id },
                {
                    workspace: {
                        members: {
                            some: {
                                userId: session.user.id,
                                role: { in: ['ADMIN', 'MEMBER'] }
                            }
                        }
                    }
                }
            ]
        }
    });

    if (!brand) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedBrand = await prisma.brand.update({
        where: { id: brandId },
        data: {
            name,
            website,
            status,
        },
    });

    return NextResponse.json(updatedBrand);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const session = await auth();
    const { brandId } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only owner or workspace admin can delete
    const brand = await prisma.brand.findFirst({
        where: {
            id: brandId,
            OR: [
                { userId: session.user.id },
                {
                    workspace: {
                        OR: [
                            { ownerId: session.user.id },
                            { members: { some: { userId: session.user.id, role: 'ADMIN' } } }
                        ]
                    }
                }
            ]
        }
    });

    if (!brand) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.brand.delete({
        where: { id: brandId },
    });

    return new NextResponse(null, { status: 204 });
}
