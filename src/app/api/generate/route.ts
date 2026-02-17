import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateAds } from "@/lib/ai";
import { checkPlanLimits } from "@/lib/usage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 0. Check Plan Limits
    try {
        const usage = await checkPlanLimits(session.user.id);
        if (!usage.allowed) {
            return new NextResponse(`Monthly limit reached (${usage.current}/${usage.limit}). Please upgrade your plan.`, { status: 403 });
        }
    } catch (error) {
        console.error('Usage check failed:', error);
    }

    try {
        const body = await req.json();
        const { brandId, prompt, angle, format, tone } = body;

        if (!brandId || !prompt || !angle || !format) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Fetch Brand Brain
        const brand = await prisma.brand.findUnique({
            where: {
                id: brandId,
                userId: session.user.id,
            },
            include: {
                brain: true,
            },
        });

        if (!brand || !brand.brain) {
            return new NextResponse("Brand Brain not found. Please analyze the brand first.", { status: 404 });
        }

        // 2. Generate Creative
        const result = await generateAds({
            brandBrain: brand.brain,
            prompt,
            angle,
            format,
            tone,
        });

        // 3. Save generation to history
        const generation = await prisma.generation.create({
            data: {
                userId: session.user.id,
                brandId: brandId,
                type: 'COPY_BODY', // General type for now
                status: 'COMPLETED',
                prompt: prompt,
                fullPrompt: '', // Could store the injected prompt here
                model: process.env.AI_PROVIDER === 'anthropic' ? 'claude-3-5-sonnet' : 'gpt-4o',
                parameters: { angle, format, tone },
                result: result.concepts,
            }
        });

        return NextResponse.json({
            id: generation.id,
            concepts: result.concepts
        });

    } catch (error) {
        console.error('Generation API error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
