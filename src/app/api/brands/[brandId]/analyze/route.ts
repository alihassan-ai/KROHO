import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse, after } from "next/server";
import { analyzeBrand } from "@/lib/ai";
import { extractTextFromPDF } from "@/lib/extractors/pdf";
import { scrapeWebsite, extractLogoUrl } from "@/lib/extractors/scraper";

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

    const brand = await prisma.brand.findUnique({
        where: { id: brandId, userId: session.user.id },
        include: { assets: true },
    });

    if (!brand) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // Accept optional wizard context from the request body
    let wizardContext: Record<string, unknown> = {};
    try {
        const body = await req.json();
        if (body && typeof body === 'object') {
            wizardContext = body;
        }
    } catch {
        // No body or invalid JSON — that's fine, wizard context is optional
    }

    // Set to ONBOARDING immediately so UI shows spinner
    await prisma.brand.update({
        where: { id: brandId },
        data: { status: 'ONBOARDING' },
    });

    // Use after() so Next.js guarantees this runs after the response is sent
    after(async () => {
        console.log(`[analyze] after() fired for brand ${brandId}`);
        try {
            let combinedContent = '';

            // Include wizard-provided context at the top so AI can validate/expand it
            if (Object.keys(wizardContext).length > 0) {
                combinedContent += `--- USER-PROVIDED BRAND CONTEXT (validate and expand upon this) ---\n${JSON.stringify(wizardContext, null, 2)}\n\n`;
            }

            for (const asset of brand.assets) {
                try {
                    const response = await fetch(asset.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const text = await extractTextFromPDF(buffer);
                    combinedContent += `\n--- GUIDELINES FROM ${asset.filename} ---\n${text}\n`;
                    console.log(`Extracted ${text.length} chars from ${asset.filename}`);
                } catch (err) {
                    console.error(`Failed to extract asset ${asset.filename}:`, err);
                }
            }

            if (brand.website) {
                // Extract logo and scrape text in parallel
                const [webText, logoUrl] = await Promise.allSettled([
                    scrapeWebsite(brand.website),
                    extractLogoUrl(brand.website),
                ]);

                if (webText.status === 'fulfilled') {
                    combinedContent += `\n--- WEBSITE CONTENT ---\n${webText.value}\n`;
                    console.log(`Scraped ${webText.value.length} chars from ${brand.website}`);
                } else {
                    console.error(`Failed to scrape website ${brand.website}:`, webText.reason);
                }

                if (logoUrl.status === 'fulfilled' && logoUrl.value) {
                    await prisma.brand.update({
                        where: { id: brandId },
                        data: { logoUrl: logoUrl.value },
                    });
                    console.log(`Logo extracted: ${logoUrl.value}`);
                }
            }

            if (!combinedContent.trim()) {
                throw new Error('No content to analyze. Upload an asset or add a website URL to the brand.');
            }

            console.log(`Starting AI analysis for brand ${brandId} (${combinedContent.length} chars)`);
            const analysis = await analyzeBrand(combinedContent);
            console.log(`AI analysis complete for brand ${brandId}`);

            // Build the upsert data covering all BrandBrain fields
            const brainData = {
                // Voice
                toneDescriptors:     analysis.voice?.toneDescriptors      ?? [],
                sentenceStyle:       analysis.voice?.sentenceStyle         ?? '',
                vocabularyLevel:     analysis.voice?.vocabularyLevel       ?? '',
                bannedWords:         analysis.voice?.bannedWords           ?? [],
                ctaStyle:            analysis.voice?.ctaStyle              ?? '',
                voiceSummary:        analysis.voice?.summary               ?? '',
                // Visual
                primaryColors:       analysis.visual?.primaryColors        ?? [],
                secondaryColors:     analysis.visual?.secondaryColors      ?? [],
                typography:          analysis.visual?.typography           ?? '',
                imageStyle:          analysis.visual?.imageStyle           ?? '',
                compositionNotes:    analysis.visual?.compositionNotes     ?? '',
                visualSummary:       analysis.visual?.summary              ?? '',
                // Products & audiences
                products:            analysis.products                     ?? [],
                audiences:           analysis.audiences                    ?? [],
                competitors:         analysis.competitors                  ?? [],
                // Strategy
                positioningStatement: analysis.strategy?.positioningStatement ?? '',
                brandArchetype:       analysis.strategy?.brandArchetype       ?? '',
                brandPersonality:     analysis.strategy?.brandPersonality     ?? [],
                missionStatement:     analysis.strategy?.missionStatement     ?? '',
                marketCategory:       analysis.strategy?.marketCategory       ?? '',
                // Deep ICP
                icpPersonas:          analysis.icpPersonas                 ?? [],
                // Content strategy
                contentPillars:       analysis.contentPillars              ?? [],
                messagingHierarchy:   analysis.messagingHierarchy          ?? {},
                // Platform playbooks
                platformPlaybooks:    analysis.platformPlaybooks           ?? {},
                // Competitive intelligence
                competitorPositioning: analysis.competitorPositioning      ?? [],
                // Value props & differentiators (from top-level or strategy)
                valuePropositions:    analysis.valuePropositions           ?? [],
                differentiators:      analysis.differentiators             ?? [],
                // Summary
                brandSummary:         analysis.brandSummary               ?? (analysis.voice?.summary ?? '') + ' ' + (analysis.visual?.summary ?? ''),
                rawAnalysis:          analysis,
            };

            await prisma.brandBrain.upsert({
                where: { brandId },
                update: brainData,
                create: { brandId, ...brainData },
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
            }).catch(() => {});
        }
    });

    return NextResponse.json({ success: true, message: 'Analysis started' });
}
