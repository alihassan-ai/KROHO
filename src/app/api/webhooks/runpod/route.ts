import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// RunPod sends a POST when a job completes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: runpodJobId, status, output } = body;

    if (!runpodJobId) return new NextResponse('Missing job id', { status: 400 });

    // Find the generation by stored runpodId in parameters
    const generation = await prisma.generation.findFirst({
      where: {
        parameters: {
          path: ['runpodId'],
          equals: runpodJobId,
        },
      },
    });

    if (!generation) {
      // Not an error — may have already been updated by polling
      return NextResponse.json({ ok: true });
    }

    if (status === 'COMPLETED') {
      const imageUrl = typeof output === 'string' ? output : output?.image ?? null;
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'COMPLETED',
          result: imageUrl,
          outputUrl: imageUrl,
        },
      });
    } else if (status === 'FAILED') {
      await prisma.generation.update({
        where: { id: generation.id },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('RunPod webhook error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
