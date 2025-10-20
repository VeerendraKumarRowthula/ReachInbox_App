// src/worker.ts
import { Worker } from 'bullmq';

const redisConnection = {
  host: 'redis', // <-- CHANGE THIS
  port: 6379,
};

console.log('✅ Worker is running and listening for jobs.');

const emailProcessor = async (job: any) => {
  const { from, to, subject } = job.data;
  console.log(`⏳ Processing job ${job.id}: Sending email to ${to}...`);
  
  await new Promise(resolve => setTimeout(resolve, 2000)); 

  console.log(`👍 Email sent to ${to}`);
};

new Worker('email-queue', emailProcessor, { connection: redisConnection });