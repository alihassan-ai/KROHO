const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterParams {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function openRouterChat(params: OpenRouterParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Creative Ops',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

// Preset model IDs for OpenRouter
export const OPENROUTER_MODELS = {
  MISTRAL_7B: 'mistralai/mistral-7b-instruct',
  LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct',
  GEMMA_7B:   'google/gemma-7b-it',
};

export async function generateSimpleCopy(
  prompt: string,
  brandContext?: Record<string, unknown> | null
): Promise<string> {
  const systemMsg = brandContext
    ? `You are a concise ad copywriter. Brand context: ${JSON.stringify(brandContext)}`
    : 'You are a concise ad copywriter.';

  return openRouterChat({
    model: OPENROUTER_MODELS.MISTRAL_7B,
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 800,
  });
}
