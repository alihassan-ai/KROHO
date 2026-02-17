import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
        const { campaignId } = body;

        const generation = await prisma.generation.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                campaignId,
            },
        });

        return NextResponse.json(generation);
    } catch (error) {
        console.error('Generation PATCH error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
