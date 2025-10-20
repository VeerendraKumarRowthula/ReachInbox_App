// src/services/queue.ts
import { Queue } from 'bullmq';

const redisConnection = {
  host: 'redis', // <-- CHANGE THIS
  port: 6379,
};

export const emailQueue = new Queue('email-queue', {
  connection: redisConnection,
});