import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import archiver from "archiver";
import { fetchImageAsBuffer, resizeImage, PLATFORM_SPECS } from "@/lib/image-processor";
import { Readable } from "stream";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const campaign = await prisma.campaign.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                brand: true,
                generations: {
                    where: {
                        status: 'COMPLETED',
                    }
                },
            },
        });

        if (!campaign) {
            return new NextResponse("Campaign not found", { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const formatType = searchParams.get('format') || 'markdown';

        if (formatType === 'json') {
            return NextResponse.json({
                campaign: campaign.name,
                brand: campaign.brand.name,
                generations: campaign.generations.map(g => ({
                    prompt: g.prompt,
                    result: g.result,
                    createdAt: g.createdAt,
                })),
            });
        }

        if (formatType === 'zip') {
            const archive = archiver('zip', { zlib: { level: 9 } });
            const stream = new Readable({
                read() { }
            });

            const response = new NextResponse(stream as any, {
                headers: {
                    "Content-Type": "application/zip",
                    "Content-Disposition": `attachment; filename="campaign-${campaign.id}.zip"`,
                },
            });

            // Start archiving in background
            (async () => {
                archive.on('data', (chunk) => stream.push(chunk));
                archive.on('end', () => stream.push(null));
                archive.on('error', (err) => {
                    console.error('Archiver error:', err);
                    stream.destroy(err);
                });

                // 1. Add copy assets as text files
                const copyGens = campaign.generations.filter(g => g.type === 'COPY_BODY');
                copyGens.forEach((gen, idx) => {
                    const concepts = gen.result as any[];
                    let content = `Campaign: ${campaign.name}\nBrand: ${campaign.brand.name}\n\n`;
                    concepts.forEach((c, cIdx) => {
                        content += `Concept ${cIdx + 1}: ${c.headline}\n`;
                        content += `${c.body}\n\n`;
                        content += `Visual Prompt: ${c.visualPrompt}\n`;
                        content += `-------------------\n\n`;
                    });
                    archive.append(content, { name: `copy/generation_${idx + 1}.txt` });
                });

                // 2. Add and resize image assets
                const imageGens = campaign.generations.filter(g => g.type === 'IMAGE_CONCEPT');
                for (let i = 0; i < imageGens.length; i++) {
                    const gen = imageGens[i];
                    try {
                        const originalBuffer = await fetchImageAsBuffer(gen.result as string);

                        // Save original
                        archive.append(originalBuffer, { name: `visuals/raw/concept_${i + 1}_original.png` });

                        // Resize for each platform
                        const platforms = campaign.platforms.length > 0 ? campaign.platforms : ['meta', 'tiktok'];
                        for (const platform of platforms) {
                            const specs = PLATFORM_SPECS[platform.toLowerCase()] || [];
                            for (const spec of specs) {
                                const resizedBuffer = await resizeImage(originalBuffer, spec.width, spec.height);
                                const filename = `visuals/${platform.toUpperCase()}/${spec.name}_concept_${i + 1}.png`;
                                archive.append(resizedBuffer, { name: filename });
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to process image ${gen.id}:`, err);
                    }
                }

                await archive.finalize();
            })();

            return response;
        }

        // Default: Markdown
        let md = `# Campaign: ${campaign.name}\n`;
        md += `Brand: ${campaign.brand.name}\n`;
        md += `Exported: ${new Date().toLocaleString()}\n\n`;
        md += `---\n\n`;

        campaign.generations.forEach((gen, gIdx) => {
            if (gen.type === 'COPY_BODY') {
                const concepts = gen.result as any[];
                md += `## Copy Generation #${gIdx + 1}\n`;
                concepts.forEach((concept: any, cIdx: number) => {
                    md += `### Concept ${cIdx + 1}: ${concept.headline}\n`;
                    md += `**Body Copy:**\n${concept.body}\n\n`;
                    md += `**Visual Prompt:**\n_${concept.visualPrompt}_\n\n`;
                });
            } else {
                md += `## Image Generation #${gIdx + 1}\n`;
                md += `Prompt: ${gen.prompt}\n\n`;
            }
            md += `---\n\n`;
        });

        return new NextResponse(md, {
            headers: {
                "Content-Type": "text/markdown",
                "Content-Disposition": `attachment; filename="campaign-${campaign.id}.md"`,
            },
        });

    } catch (error) {
        console.error('Export API error:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
