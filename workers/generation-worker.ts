/**
 * generation-worker.ts
 * BullMQ worker for async generation jobs (copy + image).
 * Run with: npx tsx workers/generation-worker.ts
 */

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

// ─── Setup ────────────────────────────────────────────
const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const redisConnection = {
  host: process.env.UPSTASH_REDIS_HOST ?? 'localhost',
  port: Number(process.env.UPSTASH_REDIS_PORT ?? 6379),
  password: process.env.UPSTASH_REDIS_PASSWORD,
  tls: process.env.UPSTASH_REDIS_TLS === 'true' ? {} : undefined,
};

// ─── Job Types ─────────────────────────────────────────
interface CopyJobData {
  type: 'copy';
  generationId: string;
  prompt: string;
  model: string;
  brandBrain: Record<string, unknown> | null;
  angle: string;
  format: string;
  count: number;
}

interface ImageJobData {
  type: 'image';
  generationId: string;
  prompt: string;
  model: string;
  width: number;
  height: number;
  steps: number;
  count: number;
  endpointId: string;
}

type JobData = CopyJobData | ImageJobData;

// ─── Copy Generation ───────────────────────────────────
async function processCopyJob(job: Job<CopyJobData>) {
  const { generationId, prompt, model, brandBrain, angle, format, count } = job.data;

  await prisma.generation.update({
    where: { id: generationId },
    data: { status: 'PROCESSING' },
  });

  const modelId = model === 'claude-opus'
    ? 'claude-opus-4-6'
    : 'claude-sonnet-4-5-20250929';

  const systemPrompt = `You are a world-class direct response copywriter.
Generate ${count} ad creative concepts as a JSON array matching this shape:
[{ "headline": "", "body": "", "visualPrompt": "", "angleUsed": "", "variants": [] }]
${brandBrain ? `Brand context: ${JSON.stringify(brandBrain)}` : ''}
Angle: ${angle}. Format: ${format}. Return ONLY valid JSON.`;

  const message = await anthropic.messages.create({
    model: modelId,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
    system: systemPrompt,
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  const concepts = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

  await prisma.generation.update({
    where: { id: generationId },
    data: {
      status: 'COMPLETED',
      result: concepts,
    },
  });

  console.log(`[copy] Job ${job.id} completed — generation ${generationId}`);
}

// ─── Image Generation (RunPod polling) ─────────────────
async function processImageJob(job: Job<ImageJobData>) {
  const { generationId, prompt, model, width, height, steps, endpointId } = job.data;

  await prisma.generation.update({
    where: { id: generationId },
    data: { status: 'PROCESSING' },
  });

  const apiKey = process.env.RUNPOD_API_KEY!;
  const submitUrl = `https://api.runpod.ai/v2/${endpointId}/run`;

  // Submit to RunPod
  const submitRes = await fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: {
        prompt,
        width,
        height,
        num_inference_steps: steps ?? (model === 'sdxl-lightning' ? 4 : 28),
        seed: Math.floor(Math.random() * 2147483647),
      },
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`RunPod submit failed: ${await submitRes.text()}`);
  }

  const { id: runpodJobId } = await submitRes.json();

  // Update generation with runpodId
  const gen = await prisma.generation.findUnique({ where: { id: generationId } });
  await prisma.generation.update({
    where: { id: generationId },
    data: {
      parameters: {
        ...(gen?.parameters as object ?? {}),
        runpodId: runpodJobId,
      },
    },
  });

  // Poll for completion (max 3 minutes)
  const statusUrl = `https://api.runpod.ai/v2/${endpointId}/status/${runpodJobId}`;
  const maxAttempts = 36; // 36 × 5s = 3 min
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!statusRes.ok) continue;
    const data = await statusRes.json();

    if (data.status === 'COMPLETED') {
      const imageUrl = typeof data.output === 'string' ? data.output : data.output?.image ?? null;
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: 'COMPLETED', result: imageUrl, outputUrl: imageUrl },
      });
      console.log(`[image] Job ${job.id} completed — generation ${generationId}`);
      return;
    }

    if (data.status === 'FAILED') {
      throw new Error(`RunPod job failed: ${JSON.stringify(data)}`);
    }
  }

  throw new Error('RunPod job timed out after 3 minutes');
}

// ─── Worker ────────────────────────────────────────────
const worker = new Worker<JobData>(
  'generation',
  async (job) => {
    if (job.data.type === 'copy') {
      await processCopyJob(job as Job<CopyJobData>);
    } else {
      await processImageJob(job as Job<ImageJobData>);
    }
  },
  {
    connection: redisConnection,
    concurrency: 4,
  }
);

worker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
  if (job?.data) {
    const genId = (job.data as any).generationId;
    if (genId) {
      await prisma.generation.update({
        where: { id: genId },
        data: { status: 'FAILED' },
      }).catch(() => {});
    }
  }
});

worker.on('error', (err) => {
  console.error('[worker] Worker error:', err);
});

console.log('[worker] Generation worker started — listening for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
