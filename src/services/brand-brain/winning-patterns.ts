import prisma from '@/lib/prisma';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function extractWinningPatterns(brandId: string) {
    const generations = await prisma.generation.findMany({
        where: { brandId, status: 'COMPLETED' },
    });

    const highPerformers = generations
        .filter(gen => {
            const data = (gen.performanceData as any) || {};
            return data.ctr && data.ctr > 0.02; // Simple threshold for prototype: 2% CTR
        })
        .map(gen => ({
            prompt: gen.prompt,
            angle: gen.angle,
            platform: gen.platform,
            performance: gen.performanceData,
            type: gen.type,
        }));

    if (highPerformers.length === 0) {
        return { success: false, message: 'Not enough high-performing data points yet.' };
    }

    const prompt = `
        Act as a Creative Director and Data Analyst. I will provide you with a list of "High Performing" ad creatives for a brand.
        Your task is to identify "Winning Patterns" – common themes, hook styles, or visual DNA that seem to be driving results.
        
        CREATIVES:
        ${JSON.stringify(highPerformers, null, 2)}
        
        Analyze these and return a structured JSON object with the following fields:
        1. "winningHooks": Array of successful hook styles/formulas.
        2. "successfulAngles": Array of pain points or benefits that resonate.
        3. "visualSuccessFactors": Array of visual elements mentioned or implied.
        4. "performanceInsight": A short paragraph summarizing WHY these are working.
        
        Return ONLY valid JSON.
    `;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : '';
        const patterns = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));

        // Update BrandBrain
        await prisma.brandBrain.update({
            where: { brandId },
            data: {
                winningPatterns: patterns,
            },
        });

        return { success: true, patterns };
    } catch (error) {
        console.error('Error extracting winning patterns:', error);
        return { success: false, error: 'AI analysis failed.' };
    }
}
