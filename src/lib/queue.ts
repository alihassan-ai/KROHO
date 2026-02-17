import { Queue } from 'bullmq';
import { connection } from './redis';

export const analysisQueue = new Queue('brand-analysis', {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    },
});

export const QUEUE_NAME = 'brand-analysis';
