import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export type GenerationAngle = 'pain_point' | 'benefit' | 'social_proof' | 'fear_of_missing_out' | 'curiosity';
export type GenerationFormat = 'meta_static' | 'meta_video' | 'tiktok_script' | 'google_search';

export interface AdGenerationParams {
    brandBrain: any;
    prompt: string;
    angle: GenerationAngle;
    format: GenerationFormat;
    tone?: string;
}

const GENERATION_SYSTEM_PROMPT = `You are a World-Class Direct Response Copywriter and Performance Marketer. 
Your goal is to generate high-converting ad creative based on a structured "Brand Brain" and a specific marketing angle.

Follow these rules:
1. STRICTLY adhere to the Brand Voice guidelines (tone, sentence style, vocabulary) provided in the Brand Brain.
2. NEVER use banned words listed in the Brand Brain.
3. Incorporate product USP and features accurately.
4. Target the specific pain points and desires of the audience segments provided.
5. (CRITICAL) Prioritize the "Winning Patterns" provided in the Brand Brain. These represent historically high-performing hooks, angles, and visual factors for this brand.

Output your response as a JSON array of "Concepts". Each concept should contain:
- "headline": A primary hook or title.
- "body": The main ad copy or script lines.
- "visualPrompt": A detailed prompt for an image/video generator to match this copy.
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

export async function generateAdCreative({
    brandBrain,
    prompt,
    angle,
    format,
    tone
}: AdGenerationParams) {
    try {
        const userPrompt = `
        BRAND CONTEXT:
        ${JSON.stringify(brandBrain, null, 2)}

        USER REQUEST:
        ${prompt}

        STRATEGIC ANGLE: ${angle.toUpperCase()}
        FORMAT: ${format.toUpperCase()}
        ${tone ? `OVERRIDING TONE: ${tone}` : ''}

        Generate 3 distinct creative concepts following the requested format.
        `;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: GENERATION_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
        });

        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Failed to find JSON in Claude response');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Ad Generation Error:', error);
        throw error;
    }
}
