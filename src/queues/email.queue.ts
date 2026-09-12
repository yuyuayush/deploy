import { Queue } from 'bullmq';
import { getRedisConnectionOptions } from '../config/redis.js';
import { EmailService, WelcomeEmailInput, PostLikeEmailInput } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

export const QUEUE_NAME = 'email-notifications';

let emailQueueInstance: Queue | null = null;
const directEmailService = new EmailService();

export function getEmailQueue(): Queue | null {
  if (!emailQueueInstance) {
    try {
      const connection = getRedisConnectionOptions();
      emailQueueInstance = new Queue(QUEUE_NAME, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      });

      emailQueueInstance.on('error', (err) => {
        logger.info(`[BULLMQ QUEUE NOTICE] Local Redis notice (${err.message}). Using direct async email mode.`);
      });
    } catch (err) {
      logger.info(`[BULLMQ INIT NOTICE] Redis unavailable: ${err}`);
      emailQueueInstance = null;
    }
  }
  return emailQueueInstance;
}

/**
 * Enqueues a welcome email background job to BullMQ, falling back to direct async dispatch if Redis is offline locally.
 */
export async function enqueueWelcomeEmail(payload: WelcomeEmailInput): Promise<void> {
  const queue = getEmailQueue();

  if (queue) {
    try {
      await queue.add('send-welcome-email', payload);
      logger.info(`[BULLMQ ENQUEUED] Welcome email job queued for ${payload.email}`);
      return;
    } catch (err) {
      logger.info(`[BULLMQ ENQUEUE NOTICE] Redis offline. Dispatching email directly for ${payload.email}`);
    }
  }

  // Direct Async Fallback (When local Redis server is not running)
  try {
    await directEmailService.sendWelcomeEmail(payload);
  } catch (directErr) {
    logger.error({ err: directErr }, `[DIRECT EMAIL ERROR] Failed to send email to ${payload.email}`);
  }
}

/**
 * Enqueues a post like notification email background job to BullMQ
 */
export async function enqueuePostLikeEmail(payload: PostLikeEmailInput): Promise<void> {
  const queue = getEmailQueue();

  if (queue) {
    try {
      await queue.add('send-post-like-email', payload);
      logger.info(`[BULLMQ ENQUEUED] Post like email job queued for ${payload.recipientEmail}`);
      return;
    } catch (err) {
      logger.info(`[BULLMQ ENQUEUE NOTICE] Redis offline. Dispatching post like email directly to ${payload.recipientEmail}`);
    }
  }

  // Direct Async Fallback (When local Redis server is not running)
  try {
    await directEmailService.sendPostLikeEmail(payload);
  } catch (directErr) {
    logger.error({ err: directErr }, `[DIRECT EMAIL ERROR] Failed to send post like email to ${payload.recipientEmail}`);
  }
}
