import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';
import { fetchImageAsBuffer, resizeImage, PLATFORM_SPECS } from '@/lib/image-processor';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { campaignId, generationIds, platforms, format } = await req.json() as {
    campaignId?: string;
    generationIds: string[];
    platforms: string[];
    format: 'zip' | 'pdf';
  };

  if (!generationIds?.length) return new NextResponse('No generations provided', { status: 400 });

  // Fetch all generations (owned by user)
  const generations = await prisma.generation.findMany({
    where: {
      id: { in: generationIds },
      userId: session.user.id,
    },
    include: { brand: { select: { name: true } }, campaign: { select: { name: true } } },
  });

  if (!generations.length) return new NextResponse('Generations not found', { status: 404 });

  // Create export record
  const exportRecord = await prisma.export.create({
    data: {
      userId: session.user.id,
      campaignId: campaignId ?? null,
      name: `Export_${new Date().toISOString().split('T')[0]}`,
      platform: platforms.join(','),
      format: format ?? 'zip',
      status: 'PROCESSING',
      generationIds,
    },
  });

  const brandName = generations[0]?.brand?.name ?? 'Brand';
  const campaignName = generations[0]?.campaign?.name ?? 'Campaign';

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = new Readable({ read() {} });

  const response = new NextResponse(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Export_${brandName}_${campaignName}.zip"`,
      'X-Export-Id': exportRecord.id,
    },
  });

  (async () => {
    archive.on('data', (chunk) => stream.push(chunk));
    archive.on('end', async () => {
      stream.push(null);
      await prisma.export.update({
        where: { id: exportRecord.id },
        data: { status: 'READY' },
      });
    });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      stream.destroy(err);
    });

    // Copy as CSV
    const copyGens = generations.filter((g) => g.type.startsWith('COPY_'));
    if (copyGens.length > 0) {
      let csv = 'Headline,Body,Visual Prompt,Angle,Platform\n';
      for (const gen of copyGens) {
        const concepts = (gen.result as any[]) ?? [];
        for (const c of concepts) {
          const row = [c.headline, c.body, c.visualPrompt, gen.angle ?? '', gen.platform ?? '']
            .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
            .join(',');
          csv += row + '\n';
        }
      }
      archive.append(csv, { name: 'copy.csv' });
    }

    // Images per platform
    const imageGens = generations.filter(
      (g) => g.type === 'IMAGE_CONCEPT' || g.type === 'IMAGE_VARIATION'
    );

    for (let i = 0; i < imageGens.length; i++) {
      const gen = imageGens[i];
      const imageSource = gen.outputUrl ?? (gen.result as string | null);
      if (!imageSource) continue;

      try {
        const buf = await fetchImageAsBuffer(imageSource);
        archive.append(buf, { name: `images/raw/concept_${i + 1}_original.png` });

        for (const platform of platforms) {
          const specs = PLATFORM_SPECS[platform.toLowerCase()];
          if (!specs) continue;
          for (const [formatKey, spec] of Object.entries(specs)) {
            const resized = await resizeImage(buf, spec.width, spec.height);
            const filename = `images/${platform.toUpperCase()}/${spec.name}_concept_${i + 1}.png`;
            archive.append(resized, { name: filename });
          }
        }
      } catch (err) {
        console.error(`Failed image ${gen.id}:`, err);
      }
    }

    await archive.finalize();
  })();

  return response;
}
