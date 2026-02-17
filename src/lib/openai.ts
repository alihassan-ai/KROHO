import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_SYSTEM_PROMPT_ANALYSIS = `You are a Brand Strategist and Creative Director. Your task is to analyze raw brand guidelines (PDF text) and website content to extract a structured "Brand Brain".

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

export async function analyzeBrandContentOpenAI(content: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: OPENAI_SYSTEM_PROMPT_ANALYSIS
                },
                {
                    role: 'user',
                    content: `Analyze the following brand content and extract the Brand Brain JSON: \n\n ${content}`
                }
            ],
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
        console.error('OpenAI Analysis Error:', error);
        throw error;
    }
}

export async function generateAdCreativeOpenAI(systemPrompt: string, userPrompt: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content || '{"concepts": []}');
    } catch (error) {
        console.error('OpenAI Generation Error:', error);
        throw error;
    }
}
