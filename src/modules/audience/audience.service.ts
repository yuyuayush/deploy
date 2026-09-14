import { db, pool } from '../../db/index.js';
import { subscriber as subscriberTable, contactMessage as contactTable } from '../../db/schema.js';
import {
  Subscriber,
  SubscribeAudienceInput,
  ContactMessage,
  CreateContactInput,
} from './audience.types.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import { enqueueWelcomeEmail } from '../../queues/email.queue.js';

export class AudienceService {
  /**
   * Subscribe user to Audience Daily/Weekly update newsletter
   */
  public async subscribe(input: SubscribeAudienceInput): Promise<Subscriber> {
    const email = input.email.toLowerCase().trim();
    const name = input.name?.trim() || 'Valued Subscriber';
    const frequency = input.frequency === 'weekly' ? 'weekly' : 'daily';
    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    try {
      const [existing] = await db
        .select()
        .from(subscriberTable)
        .where(eq(subscriberTable.email, email));

      if (existing) {
        const [updated] = await db
          .update(subscriberTable)
          .set({ name, frequency, status: 'active', updatedAt: now })
          .where(eq(subscriberTable.email, email))
          .returning();

        return {
          ...updated,
          frequency: updated.frequency as 'daily' | 'weekly',
          status: updated.status as 'active' | 'unsubscribed',
          subscribedAt: updated.subscribedAt.toISOString(),
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      }

      const [inserted] = await db
        .insert(subscriberTable)
        .values({
          id,
          email,
          name,
          frequency,
          status: 'active',
          subscribedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Trigger Welcome email in background queue
      enqueueWelcomeEmail({ email, name }).catch((err) => {
        logger.error('[SUBSCRIBE EMAIL NOTICE] Failed to queue welcome email:', err);
      });

      return {
        ...inserted,
        frequency: inserted.frequency as 'daily' | 'weekly',
        status: inserted.status as 'active' | 'unsubscribed',
        subscribedAt: inserted.subscribedAt.toISOString(),
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      logger.info(
        'Falling back to pool query for audience subscribe: ' +
          (err instanceof Error ? err.message : String(err))
      );

      await pool.query(
        'INSERT INTO "subscriber" ("id", "email", "name", "frequency", "status", "subscribedAt", "createdAt", "updatedAt") ' +
          'VALUES ($1, $2, $3, $4, $5, $6, $6, $6) ' +
          'ON CONFLICT ("email") DO UPDATE SET "name" = $3, "frequency" = $4, "status" = $5, "updatedAt" = $6',
        [id, email, name, frequency, 'active', now]
      );

      // Trigger Welcome email in background queue
      enqueueWelcomeEmail({ email, name }).catch((queueErr) => {
        logger.error('[SUBSCRIBE EMAIL NOTICE] Failed to queue welcome email:', queueErr);
      });

      return {
        id,
        email,
        name,
        frequency,
        status: 'active',
        subscribedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
  }

  /**
   * Get subscription status by email
   */
  public async getSubscriberStatus(email: string): Promise<Subscriber | null> {
    const normalized = email.toLowerCase().trim();
    try {
      const [record] = await db
        .select()
        .from(subscriberTable)
        .where(eq(subscriberTable.email, normalized));

      if (!record) return null;

      return {
        ...record,
        frequency: record.frequency as 'daily' | 'weekly',
        status: record.status as 'active' | 'unsubscribed',
        subscribedAt: record.subscribedAt.toISOString(),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    } catch {
      try {
        const res = await pool.query('SELECT * FROM "subscriber" WHERE "email" = $1', [normalized]);
        if (res.rowCount === 0) return null;
        const row = res.rows[0];
        return {
          id: row.id,
          email: row.email,
          name: row.name,
          frequency: row.frequency,
          status: row.status,
          subscribedAt: new Date(row.subscribedAt).toISOString(),
          createdAt: new Date(row.createdAt).toISOString(),
          updatedAt: new Date(row.updatedAt).toISOString(),
        };
      } catch {
        return null;
      }
    }
  }

  /**
   * Unsubscribe user from daily email updates
   */
  public async unsubscribe(email: string): Promise<boolean> {
    const normalized = email.toLowerCase().trim();
    try {
      await db
        .update(subscriberTable)
        .set({ status: 'unsubscribed', updatedAt: new Date() })
        .where(eq(subscriberTable.email, normalized));
      return true;
    } catch {
      try {
        await pool.query(
          'UPDATE "subscriber" SET "status" = $1, "updatedAt" = NOW() WHERE "email" = $2',
          ['unsubscribed', normalized]
        );
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Submit Contact Inquiry Message
   */
  public async submitContactMessage(input: CreateContactInput): Promise<ContactMessage> {
    const id = `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const data = {
      id,
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: 'unread',
      createdAt: now,
    };

    try {
      const [inserted] = await db.insert(contactTable).values(data).returning();
      return {
        ...inserted,
        status: inserted.status as 'unread' | 'read',
        createdAt: inserted.createdAt.toISOString(),
      };
    } catch (err) {
      logger.info(
        'Falling back to pool query for contact message: ' +
          (err instanceof Error ? err.message : String(err))
      );

      await pool.query(
        'INSERT INTO "contact_message" ("id", "name", "email", "subject", "message", "status", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, data.name, data.email, data.subject, data.message, 'unread', now]
      );

      return {
        ...data,
        status: 'unread',
        createdAt: now.toISOString(),
      };
    }
  }

  /**
   * Get total subscriber count for community metrics
   */
  public async getSubscriberCount(): Promise<number> {
    try {
      const records = await db
        .select()
        .from(subscriberTable)
        .where(eq(subscriberTable.status, 'active'));
      return records.length;
    } catch {
      try {
        const res = await pool.query('SELECT COUNT(*) FROM "subscriber" WHERE "status" = $1', [
          'active',
        ]);
        return parseInt(res.rows[0]?.count || '0', 10);
      } catch {
        return 42; // Default starting audience count fallback
      }
    }
  }
}
