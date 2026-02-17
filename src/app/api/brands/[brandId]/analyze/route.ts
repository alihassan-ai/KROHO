import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { analyzeBrand } from "@/lib/ai";
import { extractTextFromPDF } from "@/lib/extractors/pdf";
import { scrapeWebsite } from "@/lib/extractors/scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
    req: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const session = await auth();
    const { brandId } = await params;

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const brand = await prisma.brand.findUnique({
        where: { id: brandId, userId: session.user.id },
        include: { assets: true },
    });

    if (!brand) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // Set to ONBOARDING immediately so UI shows spinner
    await prisma.brand.update({
        where: { id: brandId },
        data: { status: 'ONBOARDING' },
    });

    // Run analysis inline (no Redis/queue needed)
    (async () => {
        try {
            let combinedContent = '';

            for (const asset of brand.assets) {
                try {
                    const response = await fetch(asset.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const text = await extractTextFromPDF(buffer);
                    combinedContent += `\n--- GUIDELINES FROM ${asset.filename} ---\n${text}\n`;
                } catch (err) {
                    console.error(`Failed to extract asset ${asset.filename}:`, err);
                }
            }

            if (brand.website) {
                try {
                    const webText = await scrapeWebsite(brand.website);
                    combinedContent += `\n--- WEBSITE CONTENT ---\n${webText}\n`;
                } catch (err) {
                    console.error(`Failed to scrape website ${brand.website}:`, err);
                }
            }

            if (!combinedContent.trim()) {
                throw new Error('No content to analyze. Upload an asset or add a website URL.');
            }

            const analysis = await analyzeBrand(combinedContent);

            await prisma.brandBrain.upsert({
                where: { brandId },
                update: {
                    toneDescriptors: analysis.voice.toneDescriptors,
                    sentenceStyle: analysis.voice.sentenceStyle,
                    vocabularyLevel: analysis.voice.vocabularyLevel,
                    bannedWords: analysis.voice.bannedWords,
                    ctaStyle: analysis.voice.ctaStyle,
                    voiceSummary: analysis.voice.summary,
                    primaryColors: analysis.visual.primaryColors,
                    secondaryColors: analysis.visual.secondaryColors,
                    typography: analysis.visual.typography,
                    imageStyle: analysis.visual.imageStyle,
                    visualSummary: analysis.visual.summary,
                    products: analysis.products,
                    audiences: analysis.audiences,
                    brandSummary: analysis.voice.summary + ' ' + analysis.visual.summary,
                    rawAnalysis: analysis,
                },
                create: {
                    brandId,
                    toneDescriptors: analysis.voice.toneDescriptors,
                    sentenceStyle: analysis.voice.sentenceStyle,
                    vocabularyLevel: analysis.voice.vocabularyLevel,
                    bannedWords: analysis.voice.bannedWords,
                    ctaStyle: analysis.voice.ctaStyle,
                    voiceSummary: analysis.voice.summary,
                    primaryColors: analysis.visual.primaryColors,
                    secondaryColors: analysis.visual.secondaryColors,
                    typography: analysis.visual.typography,
                    imageStyle: analysis.visual.imageStyle,
                    visualSummary: analysis.visual.summary,
                    products: analysis.products,
                    audiences: analysis.audiences,
                    brandSummary: analysis.voice.summary + ' ' + analysis.visual.summary,
                    rawAnalysis: analysis,
                },
            });

            await prisma.brand.update({
                where: { id: brandId },
                data: { status: 'ACTIVE' },
            });

            console.log(`Brand analysis complete: ${brandId}`);
        } catch (error) {
            console.error(`Brand analysis failed for ${brandId}:`, error);
            await prisma.brand.update({
                where: { id: brandId },
                data: { status: 'ONBOARDING' },
            });
        }
    })();

    // Return immediately — UI polls for status updates
    return NextResponse.json({ success: true, message: 'Analysis started' });
}
