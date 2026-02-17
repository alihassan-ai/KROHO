import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { submitRunPodJob } from '@/lib/platforms/runpod';
import { checkPlanLimits } from '@/lib/usage';
import { NextResponse } from 'next/server';
import type { GenerateVariationParams } from '@/types/generation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const usage = await checkPlanLimits(session.user.id);
  if (!usage.allowed) {
    return new NextResponse(
      `Monthly limit reached (${usage.current}/${usage.limit}). Please upgrade.`,
      { status: 429 }
    );
  }

  const body: GenerateVariationParams = await req.json();
  const { sourceGenerationId, variationType, params } = body;

  const source = await prisma.generation.findUnique({
    where: { id: sourceGenerationId, userId: session.user.id },
  });
  if (!source) return new NextResponse('Source generation not found', { status: 404 });

  const MODEL_ENDPOINTS: Record<string, string | undefined> = {
    'flux-dev': process.env.RUNPOD_FLUX_ENDPOINT_ID,
    'sdxl-lightning': process.env.RUNPOD_SDXL_ENDPOINT_ID,
  };

  try {
    if (source.type === 'COPY_BODY' || source.type === 'COPY_HEADLINE' || source.type === 'COPY_HOOK') {
      // Copy variation — regenerate with same prompt + tweaks
      const { generateAdCreative } = await import('@/lib/generator');
      const brain = source.brandId
        ? await prisma.brandBrain.findUnique({ where: { brandId: source.brandId } })
        : null;

      let prompt = source.prompt;
      if (variationType === 'prompt_tweak' && params.promptAddition) {
        prompt = `${prompt}\n\nAdditional direction: ${params.promptAddition}`;
      }

      const result = await generateAdCreative({
        brandBrain: brain,
        prompt,
        angle: (source.angle ?? 'benefit') as any,
        format: (source.platform ?? 'meta_static') as any,
      });

      const newGen = await prisma.generation.create({
        data: {
          userId: session.user.id,
          brandId: source.brandId,
          campaignId: source.campaignId,
          type: 'COPY_VARIATION',
          status: 'COMPLETED',
          prompt,
          model: source.model,
          result: result.concepts as any,
          angle: source.angle,
          platform: source.platform,
        },
      });

      return NextResponse.json({ ...newGen, type: 'COPY_VARIATION' });
    }

    // Image variation
    const sourceParams = source.parameters as Record<string, unknown> | null;
    const model = (params.targetModel ?? source.model) as string;
    const endpointId = MODEL_ENDPOINTS[model];
    if (!endpointId) return new NextResponse('Model endpoint not configured', { status: 500 });

    let prompt = source.fullPrompt ?? source.prompt;
    if (variationType === 'prompt_tweak' && params.promptAddition) {
      prompt = `${prompt}, ${params.promptAddition}`;
    }

    const width = params.targetWidth ?? (sourceParams?.width as number | undefined) ?? 1024;
    const height = params.targetHeight ?? (sourceParams?.height as number | undefined) ?? 1024;
    const seed = variationType === 'seed_lock'
      ? (params.seed ?? (sourceParams?.seed as number | undefined))
      : undefined;

    const newGen = await prisma.generation.create({
      data: {
        userId: session.user.id,
        brandId: source.brandId,
        campaignId: source.campaignId,
        type: 'IMAGE_VARIATION',
        status: 'PENDING',
        prompt: source.prompt,
        fullPrompt: prompt,
        model,
        parameters: { width, height, seed },
      },
    });

    const job = await submitRunPodJob(endpointId, {
      prompt,
      width,
      height,
      num_inference_steps: model === 'sdxl-lightning' ? 4 : 28,
      ...(seed ? { seed } : {}),
    });

    await prisma.generation.update({
      where: { id: newGen.id },
      data: { parameters: { width, height, seed, runpodId: job.id } },
    });

    return NextResponse.json({
      generationId: newGen.id,
      jobId: job.id,
      type: 'IMAGE_VARIATION',
      model,
      prompt: source.prompt,
    });
  } catch (err) {
    console.error('Variation error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
