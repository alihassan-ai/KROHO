import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { deleteFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

// DELETE /api/brands/[brandId]/assets/[assetId]
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ brandId: string; assetId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { brandId, assetId } = await params;

    // Verify the brand belongs to this user
    const brand = await prisma.brand.findFirst({
        where: { id: brandId, userId: session.user.id },
    });
    if (!brand) {
        return new NextResponse("Not found", { status: 404 });
    }

    // Fetch the asset
    const asset = await prisma.brandAsset.findFirst({
        where: { id: assetId, brandId },
    });
    if (!asset) {
        return new NextResponse("Asset not found", { status: 404 });
    }

    // Extract the storage path from the public URL
    // URLs look like: https://.../storage/v1/object/public/brand-assets/{userId}/{brandId}/...
    try {
        const url = new URL(asset.url);
        // path after /public/brand-assets/
        const marker = '/object/public/brand-assets/';
        const markerIdx = url.pathname.indexOf(marker);
        if (markerIdx !== -1) {
            const storagePath = url.pathname.slice(markerIdx + marker.length);
            await deleteFile('brand-assets', storagePath);
        }
    } catch (err) {
        // If storage deletion fails, still remove from DB — the file can be cleaned up later
        console.error('Storage deletion failed (continuing with DB deletion):', err);
    }

    await prisma.brandAsset.delete({ where: { id: assetId } });

    return new NextResponse(null, { status: 204 });
}
