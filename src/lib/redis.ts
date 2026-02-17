import { Redis } from 'ioredis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// BullMQ needs ioredis, so we need to convert Upstash REST URL to redis:// or rediss://
// Usually Upstash provides a redis connection string as well.
// If only REST is provided, we might need the direct Redis URL.
// Checking blueprint... it says ioredis.

const connectionString = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection = new Redis(connectionString, {
    maxRetriesPerRequest: null,
});
