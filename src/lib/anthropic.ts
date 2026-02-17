import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SYSTEM_PROMPT = `You are a Brand Strategist and Creative Director. Your task is to analyze raw brand guidelines (PDF text) and website content to extract a structured "Brand Brain".

Return your analysis in the following JSON format:
{
  "voice": {
    "toneDescriptors": ["playful", "professional", etc],
    "sentenceStyle": "short and punchy / descriptive",
    "vocabularyLevel": "casual / technical / luxury",
    "bannedWords": [],
    "ctaStyle": "direct / subtle",
    "summary": "AI generated voice summary"
  },
  "visual": {
    "primaryColors": ["#hexcode"],
    "secondaryColors": [],
    "typography": "font names",
    "imageStyle": "photography / illustration",
    "summary": "AI generated visual DNA summary"
  },
  "products": [
    {"name": "...", "features": "...", "usp": "..."}
  ],
  "audiences": [
    {"name": "...", "painPoints": "...", "desires": "..."}
  ]
}`;

export async function analyzeBrandContent(content: string) {
    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Analyze the following brand content and extract the Brand Brain JSON: \n\n ${content}`
                }
            ],
        });

        // Extract JSON from response
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Failed to find JSON in Claude response');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Claude Analysis Error:', error);
        throw error;
    }
}
