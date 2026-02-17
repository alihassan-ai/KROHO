import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/brands/[brandId]/brain
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
  });
  if (!brand) return new NextResponse('Not found', { status: 404 });

  const brain = await prisma.brandBrain.findUnique({ where: { brandId } });
  if (!brain) return new NextResponse('Brain not found', { status: 404 });

  return NextResponse.json(brain);
}

// PATCH /api/brands/[brandId]/brain — user corrections
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { brandId } = await params;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
  });
  if (!brand) return new NextResponse('Not found', { status: 404 });

  const body = await req.json();

  // Whitelist only editable fields
  const {
    toneDescriptors, sentenceStyle, vocabularyLevel, bannedWords, ctaStyle, voiceSummary,
    primaryColors, secondaryColors, typography, imageStyle, compositionNotes, visualSummary,
    products, valuePropositions, differentiators, audiences, competitors, brandSummary,
  } = body;

  const updated = await prisma.brandBrain.update({
    where: { brandId },
    data: {
      ...(toneDescriptors !== undefined && { toneDescriptors }),
      ...(sentenceStyle !== undefined && { sentenceStyle }),
      ...(vocabularyLevel !== undefined && { vocabularyLevel }),
      ...(bannedWords !== undefined && { bannedWords }),
      ...(ctaStyle !== undefined && { ctaStyle }),
      ...(voiceSummary !== undefined && { voiceSummary }),
      ...(primaryColors !== undefined && { primaryColors }),
      ...(secondaryColors !== undefined && { secondaryColors }),
      ...(typography !== undefined && { typography }),
      ...(imageStyle !== undefined && { imageStyle }),
      ...(compositionNotes !== undefined && { compositionNotes }),
      ...(visualSummary !== undefined && { visualSummary }),
      ...(products !== undefined && { products }),
      ...(valuePropositions !== undefined && { valuePropositions }),
      ...(differentiators !== undefined && { differentiators }),
      ...(audiences !== undefined && { audiences }),
      ...(competitors !== undefined && { competitors }),
      ...(brandSummary !== undefined && { brandSummary }),
    },
  });

  return NextResponse.json(updated);
}
