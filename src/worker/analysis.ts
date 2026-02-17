import { Worker, Job } from 'bullmq';
import { connection } from '@/lib/redis';
import { QUEUE_NAME } from '@/lib/queue';
import prisma from '@/lib/prisma';
import { extractTextFromPDF } from '@/lib/extractors/pdf';
import { scrapeWebsite } from '@/lib/extractors/scraper';
import { analyzeBrand } from '@/lib/ai';

export const analysisWorker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
        const { brandId } = job.data;
        console.log(`Starting analysis for brand: ${brandId}`);

        try {
            // 1. Fetch brand and guidelines
            const brand = await prisma.brand.findUnique({
                where: { id: brandId },
                include: {
                    assets: {
                        where: { type: 'BRAND_GUIDELINES' },
                    },
                },
            });

            if (!brand) throw new Error('Brand not found');

            let combinedContent = '';

            // 2. Extract from PDFs
            for (const asset of brand.assets) {
                try {
                    const response = await fetch(asset.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const text = await extractTextFromPDF(buffer);
                    combinedContent += `\n--- GUIDELINES FROM ${asset.filename} ---\n${text}\n`;
                } catch (err) {
                    console.error(`Failed to extract from asset ${asset.filename}:`, err);
                }
            }

            // 3. Extract from Website
            if (brand.website) {
                try {
                    const webText = await scrapeWebsite(brand.website);
                    combinedContent += `\n--- WEBSITE CONTENT ---\n${webText}\n`;
                } catch (err) {
                    console.error(`Failed to scrape website ${brand.website}:`, err);
                }
            }

            if (!combinedContent.trim()) {
                throw new Error('No content found to analyze');
            }

            // 4. Send to AI Provider
            const analysis = await analyzeBrand(combinedContent);

            // 5. Save to BrandBrain
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

            // 6. Update Status
            await prisma.brand.update({
                where: { id: brandId },
                data: { status: 'ACTIVE' },
            });

            console.log(`Successfully analyzed brand: ${brandId}`);
        } catch (error) {
            console.error(`Analysis failed for brand ${brandId}:`, error);
            // Update status back to ONBOARDING or a new FAILED status if we want to show error
            await prisma.brand.update({
                where: { id: brandId },
                data: { status: 'ONBOARDING' },
            });
            throw error;
        }
    },
    {
        connection: connection as any,
        concurrency: 5,
    }
);

analysisWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

analysisWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
});
