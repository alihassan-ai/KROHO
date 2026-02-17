import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const session = await auth();
    const { brandId } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
        return new NextResponse("No files uploaded", { status: 400 });
    }

    const results = [];

    for (const file of files) {
        try {
            // 1. Upload to Supabase Storage
            const path = `${session.user.id}/${brandId}/${Date.now()}-${file.name}`;
            const { publicUrl } = await uploadFile(file, 'brand-assets', path);

            // 2. Create BrandAsset record in DB
            const asset = await prisma.brandAsset.create({
                data: {
                    brandId: brandId,
                    filename: file.name,
                    url: publicUrl,
                    mimeType: file.type,
                    sizeBytes: file.size,
                    type: file.type.includes('pdf') ? 'BRAND_GUIDELINES' : 'OTHER', // Basic heuristic for now
                },
            });

            results.push(asset);
        } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
        }
    }

    return NextResponse.json(results);
}
