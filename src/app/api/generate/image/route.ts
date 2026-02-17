import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { submitRunPodJob } from "@/lib/platforms/runpod";
import { buildVisualPrompt } from "@/lib/prompt-builder";
import { checkPlanLimits } from "@/lib/usage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MODEL_ENDPOINTS: Record<string, string | undefined> = {
    "flux-dev": process.env.RUNPOD_FLUX_ENDPOINT_ID,
    "sdxl-lightning": process.env.RUNPOD_SDXL_ENDPOINT_ID,
};

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
        const { brandId, prompt, model, width, height, steps, useBrandContext } = body;

        if (!prompt || !model) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const endpointId = MODEL_ENDPOINTS[model];
        if (!endpointId) {
            return new NextResponse(`Endpoint for model ${model} not configured`, { status: 500 });
        }

        // 1. Assemble Brand Context for Visuals
        let finalPrompt = prompt;
        if (useBrandContext && brandId) {
            const brain = await prisma.brandBrain.findUnique({
                where: { brandId }
            });

            if (brain) {
                finalPrompt = buildVisualPrompt(prompt, brain);
            }
        }

        // 2. Create Generation Record
        const generation = await prisma.generation.create({
            data: {
                userId: session.user.id,
                brandId: brandId,
                type: 'IMAGE_CONCEPT',
                status: 'PENDING',
                prompt: prompt,
                fullPrompt: finalPrompt,
                model: model,
                parameters: { width, height, steps },
            }
        });

        // 3. Submit to RunPod
        const job = await submitRunPodJob(endpointId, {
            prompt: finalPrompt,
            width: width || 1024,
            height: height || 1024,
            num_inference_steps: steps || (model === 'sdxl-lightning' ? 4 : 28),
        });

        // 4. Update with Job ID
        await prisma.generation.update({
            where: { id: generation.id },
            data: {
                parameters: {
                    ...(generation.parameters as object || {}),
                    runpodId: job.id
                }
            }
        });

        return NextResponse.json({
            jobId: job.id,
            generationId: generation.id
        });

    } catch (error) {
        console.error('Image Generation API Error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
