import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch brands where user is owner OR a member of the workspace
    const brands = await prisma.brand.findMany({
        where: {
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
        },
    });

    return NextResponse.json(brands);
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, website } = body;

    if (!name) {
        return new NextResponse("Name is required", { status: 400 });
    }

    // 1. Ensure user has a workspace
    let workspace = await prisma.workspace.findFirst({
        where: { ownerId: session.user.id }
    });

    if (!workspace) {
        workspace = await prisma.workspace.create({
            data: {
                name: `${session.user.name || 'Personal'}'s Workspace`,
                ownerId: session.user.id,
            }
        });
    }

    // 2. Create brand within workspace
    const brand = await prisma.brand.create({
        data: {
            name,
            website,
            userId: session.user.id,
            workspaceId: workspace.id,
        },
    });

    return NextResponse.json(brand);
}
