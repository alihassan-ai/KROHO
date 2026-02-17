import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRunPodStatus } from "@/lib/platforms/runpod";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const session = await auth();
    const { jobId } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 1. Find the generation by RunPod ID (stored in parameters)
        // Note: For actual high-scale this should be indexed, 
        // but for MVP we search by parameters JSON or pass generationId from FE
        const { searchParams } = new URL(req.url);
        const generationId = searchParams.get('generationId');

        if (!generationId) {
            return new NextResponse("Missing generationId", { status: 400 });
        }

        const generation = await prisma.generation.findUnique({
            where: { id: generationId, userId: session.user.id }
        });

        if (!generation) {
            return new NextResponse("Generation not found", { status: 404 });
        }

        // 2. Check RunPod Status
        const endpointId = generation.model === 'flux-dev'
            ? process.env.RUNPOD_FLUX_ENDPOINT_ID
            : process.env.RUNPOD_SDXL_ENDPOINT_ID;

        if (!endpointId) throw new Error("Endpoint not configured for polling");

        const status = await checkRunPodStatus(endpointId, jobId);

        // 3. Update DB if finished
        if (status.status === 'COMPLETED') {
            const imageUrl = status.output; // RunPod output is usually the image URL or base64

            await prisma.generation.update({
                where: { id: generationId },
                data: {
                    status: 'COMPLETED',
                    result: status.output, // Store result (could be S3/Supabase URL if runpod handles it)
                }
            });
        } else if (status.status === 'FAILED') {
            await prisma.generation.update({
                where: { id: generationId },
                data: { status: 'FAILED' }
            });
        }

        return NextResponse.json(status);

    } catch (error) {
        console.error('Status Polling Error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
