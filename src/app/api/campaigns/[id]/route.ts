import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const campaign = await prisma.campaign.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                brand: true,
                generations: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!campaign) {
            return new NextResponse("Campaign not found", { status: 404 });
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Campaign GET error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            name,
            status,
            objective,
            platforms,
            formats,
            instructions
        } = body;

        const campaign = await prisma.campaign.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                name,
                status,
                objective,
                platforms,
                formats,
                instructions,
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Campaign PATCH error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
