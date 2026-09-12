import { Worker, Job } from 'bullmq';
import { QUEUE_NAME } from '../queues/email.queue.js';
import { getRedisConnectionOptions } from '../config/redis.js';
import { EmailService, WelcomeEmailInput, PostLikeEmailInput } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

let emailWorkerInstance: Worker | null = null;
const emailService = new EmailService();

export function initEmailWorker(): Worker | null {
  if (emailWorkerInstance) return emailWorkerInstance;

  try {
    const connection = getRedisConnectionOptions();
    emailWorkerInstance = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        logger.info(`[BULLMQ WORKER] Processing job #${job.id} '${job.name}'`);
        if (job.name === 'send-welcome-email') {
          await emailService.sendWelcomeEmail(job.data as WelcomeEmailInput);
        } else if (job.name === 'send-post-like-email') {
          await emailService.sendPostLikeEmail(job.data as PostLikeEmailInput);
        }
      },
      {
        connection,
        concurrency: 5,
      }
    );

    emailWorkerInstance.on('completed', (job: Job) => {
      logger.info(`[BULLMQ WORKER SUCCESS] Job #${job.id} completed successfully`);
    });

    emailWorkerInstance.on('failed', (job: Job | undefined, err: Error) => {
      logger.error({ err }, `[BULLMQ WORKER FAILED] Job #${job?.id || 'unknown'} failed`);
    });

    emailWorkerInstance.on('error', (err: Error) => {
      logger.info(`[BULLMQ WORKER NOTICE] Worker connection notice: ${err.message}`);
    });

    logger.info('🚀 BullMQ Email Worker initialized and listening for jobs...');
    return emailWorkerInstance;
  } catch (err) {
    logger.info(`[BULLMQ WORKER INIT NOTICE] Redis worker not started: ${err}`);
    return null;
  }
}

export async function closeEmailWorker(): Promise<void> {
  if (emailWorkerInstance) {
    await emailWorkerInstance.close();
    emailWorkerInstance = null;
    logger.info('BullMQ Email Worker shut down gracefully.');
  }
}
