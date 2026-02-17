import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const brandId = searchParams.get('brandId');

        // Fetch campaigns where user is owner OR brand belongs to a workspace the user is in
        const campaigns = await prisma.campaign.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    {
                        brand: {
                            workspace: {
                                members: {
                                    some: { userId: session.user.id }
                                }
                            }
                        }
                    }
                ],
                ...(brandId ? { brandId } : {}),
            },
            orderBy: {
                updatedAt: 'desc',
            },
            include: {
                brand: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('Campaign GET error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            name,
            brandId,
            objective,
            platforms,
            formats,
            instructions
        } = body;

        if (!name || !brandId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify brand access
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
            }
        });

        if (!brand) {
            return new NextResponse("Forbidden: No access to this brand", { status: 403 });
        }

        const campaign = await prisma.campaign.create({
            data: {
                name,
                brandId,
                userId: session.user.id,
                objective,
                platforms: platforms || [],
                formats: formats || [],
                instructions,
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Campaign POST error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
