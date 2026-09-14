import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { getQuoteForDay } from '../constants/quotes.js';
import { EmailService } from '../services/email.service.js';
import { db, pool } from '../db/index.js';
import { subscriber as subscriberTable } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const emailService = new EmailService();

/**
   Dispatches today's 8:00 AM daily motivational quote to all active daily subscribers
 */
export async function dispatchDailyQuotesNow(): Promise<{ count: number; quote: unknown }> {
  const quote = getQuoteForDay();
  logger.info(
    `[DAILY QUOTE CRON] Starting 8:00 AM daily quote dispatch. Quote #${quote.id} by ${quote.author}...`
  );

  let activeSubscribers: { email: string; name: string }[] = [];

  try {
    const records = await db
      .select({ email: subscriberTable.email, name: subscriberTable.name })
      .from(subscriberTable)
      .where(and(eq(subscriberTable.status, 'active'), eq(subscriberTable.frequency, 'daily')));

    activeSubscribers = records;
  } catch (err) {
    logger.info(
      '[DAILY QUOTE CRON] Falling back to pool query for subscribers: ' +
        (err instanceof Error ? err.message : String(err))
    );

    try {
      const res = await pool.query(
        'SELECT "email", "name" FROM "subscriber" WHERE "status" = $1 AND "frequency" = $2',
        ['active', 'daily']
      );
      activeSubscribers = res.rows;
    } catch (poolErr) {
      logger.error({ poolErr }, '[DAILY QUOTE CRON ERROR] Failed to fetch subscribers');
    }
  }

  if (activeSubscribers.length === 0) {
    logger.info('[DAILY QUOTE CRON] No active daily subscribers found. Skipping dispatch.');
    return { count: 0, quote };
  }

  logger.info(
    `[DAILY QUOTE CRON] Found ${activeSubscribers.length} active subscriber(s). Dispatching email notifications...`
  );

  let dispatchedCount = 0;
  for (const sub of activeSubscribers) {
    try {
      const sent = await emailService.sendDailyQuoteEmail({
        email: sub.email,
        name: sub.name,
        quote,
      });
      if (sent) dispatchedCount++;
    } catch (sendErr) {
      logger.error({ sendErr }, `[DAILY QUOTE CRON ERROR] Failed to send email to ${sub.email}`);
    }
  }

  logger.info(
    `[DAILY QUOTE CRON COMPLETE] Successfully dispatched ${dispatchedCount} morning quote email(s).`
  );
  return { count: dispatchedCount, quote };
}

/**
 * Initializes the 8:00 AM Morning Quote Cron Job Scheduler
 * Schedule: "0 8 * * *" (Every morning at 08:00 AM)
 */
export function initDailyQuoteCron(): void {
  logger.info('⏰ Initializing 8:00 AM Daily Morning Motivation Quote Cron Scheduler...');

  // Schedule task every day at 8:00 AM (0 8 * * *)
  cron.schedule('0 8 * * *', async () => {
    logger.info('🌅 [CRON TRIGGER 08:00 AM] Running daily morning quote email dispatch job...');
    await dispatchDailyQuotesNow();
  });

  logger.info(
    '✅ 8:00 AM Daily Quote Cron Scheduler successfully active! (Cron Pattern: "0 8 * * *")'
  );
}
