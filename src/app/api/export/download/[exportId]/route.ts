import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exportId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { exportId } = await params;

  const exportRecord = await prisma.export.findFirst({
    where: { id: exportId, userId: session.user.id },
  });

  if (!exportRecord) return new NextResponse('Export not found', { status: 404 });
  if (exportRecord.status === 'EXPIRED') return new NextResponse('Export expired', { status: 410 });
  if (exportRecord.status !== 'READY') {
    return NextResponse.json({ status: exportRecord.status }, { status: 202 });
  }

  if (!exportRecord.fileUrl) return new NextResponse('File not available', { status: 404 });

  // Redirect to signed download URL (Supabase or S3)
  return NextResponse.redirect(exportRecord.fileUrl);
}
