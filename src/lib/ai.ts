import { analyzeBrandContent as analyzeAnthropic } from './anthropic';
import { analyzeBrandContentOpenAI } from './openai';
import { generateAdCreative as generateAnthropic, AdGenerationParams } from './generator';
import { generateAdCreativeOpenAI } from './openai';

const GENERATION_SYSTEM_PROMPT = `You are a World-Class Direct Response Copywriter and Performance Marketer. 
Your goal is to generate high-converting ad creative based on a structured "Brand Brain" and a specific marketing angle.

Follow these rules:
1. STRICTLY adhere to the Brand Voice guidelines (tone, sentence style, vocabulary) provided in the Brand Brain.
2. NEVER use banned words listed in the Brand Brain.
3. Incorporate product USP and features accurately.
4. Target the specific pain points and desires of the audience segments provided.
5. (CRITICAL) Prioritize the "Winning Patterns" provided in the Brand Brain. These represent historically high-performing hooks, angles, and visual factors for this brand.

Output your response as a JSON object with a "concepts" array. Each concept should contain:
- "headline": A primary hook or title.
- "body": The main ad copy or script lines.
- "visualPrompt": A detailed prompt for an image/video generator to match this copy.
- "angleUsed": The strategic angle used.
- "variants": An array of 3 alternatives for the headline/hook.

Format:
{
  "concepts": [
    {
      "headline": "...",
      "body": "...",
      "visualPrompt": "...",
      "angleUsed": "...",
      "variants": ["alt 1", "alt 2", "alt 3"]
    }
  ]
}
`;

export async function analyzeBrand(content: string) {
    const provider = process.env.AI_PROVIDER || 'openai';

    if (provider === 'anthropic') {
        return analyzeAnthropic(content);
    }

    return analyzeBrandContentOpenAI(content);
}

export async function generateAds(params: AdGenerationParams) {
    const provider = process.env.AI_PROVIDER || 'openai';

    const userPrompt = `
        BRAND CONTEXT:
        ${JSON.stringify(params.brandBrain, null, 2)}

        USER REQUEST:
        ${params.prompt}

        STRATEGIC ANGLE: ${params.angle.toUpperCase()}
        FORMAT: ${params.format.toUpperCase()}
        ${params.tone ? `OVERRIDING TONE: ${params.tone}` : ''}

        Generate 3 distinct creative concepts following the requested format.
    `;

    if (provider === 'anthropic') {
        return generateAnthropic(params);
    }

    return generateAdCreativeOpenAI(GENERATION_SYSTEM_PROMPT, userPrompt);
}
