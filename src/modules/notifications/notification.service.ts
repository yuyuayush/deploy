import { db, pool } from '../../db/index.js';
import { notification as notificationTable } from '../../db/schema.js';
import { NotificationItem, CreateNotificationInput } from './notification.types.js';
import { ApiError } from '../../utils/api-error.js';
import { desc, eq } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';

export class NotificationService {
  public async getNotificationsForUser(recipientEmail?: string): Promise<NotificationItem[]> {
    try {
      let query = db.select().from(notificationTable).orderBy(desc(notificationTable.createdAt)).limit(50);
      let results;
      if (recipientEmail) {
        results = await db
          .select()
          .from(notificationTable)
          .where(eq(notificationTable.recipientEmail, recipientEmail))
          .orderBy(desc(notificationTable.createdAt))
          .limit(50);
      } else {
        results = await query;
      }

      return results.map((n) => ({
        ...n,
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      logger.info(
        'Falling back to pool query for notifications: ' +
          (err instanceof Error ? err.message : String(err))
      );

      let sql = 'SELECT * FROM "notification"';
      const values: string[] = [];
      if (recipientEmail) {
        sql += ' WHERE "recipientEmail" = $1';
        values.push(recipientEmail);
      }
      sql += ' ORDER BY "createdAt" DESC LIMIT 50';

      const res = await pool.query(sql, values);
      return res.rows.map((n) => ({
        id: n.id,
        recipientEmail: n.recipientEmail,
        senderName: n.senderName,
        senderEmail: n.senderEmail,
        type: n.type,
        postId: n.postId,
        postContent: n.postContent,
        message: n.message,
        read: Boolean(n.read),
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : new Date().toISOString(),
      }));
    }
  }

  public async createNotification(input: CreateNotificationInput): Promise<NotificationItem> {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newNotifData = {
      id,
      recipientEmail: input.recipientEmail,
      senderName: input.senderName,
      senderEmail: input.senderEmail || null,
      type: input.type,
      postId: input.postId || null,
      postContent: input.postContent || null,
      message: input.message,
      read: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const [inserted] = await db.insert(notificationTable).values(newNotifData).returning();
      return {
        ...inserted,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      logger.info(
        'Falling back to pool insert for notifications: ' +
          (err instanceof Error ? err.message : String(err))
      );

      await pool.query(
        'CREATE TABLE IF NOT EXISTS "notification" (' +
          '"id" text PRIMARY KEY, ' +
          '"recipientEmail" text NOT NULL, ' +
          '"senderName" text NOT NULL, ' +
          '"senderEmail" text, ' +
          '"type" text NOT NULL, ' +
          '"postId" text, ' +
          '"postContent" text, ' +
          '"message" text NOT NULL, ' +
          '"read" boolean NOT NULL DEFAULT false, ' +
          '"createdAt" timestamp NOT NULL DEFAULT NOW(), ' +
          '"updatedAt" timestamp NOT NULL DEFAULT NOW()' +
          ')'
      );

      await pool.query(
        'INSERT INTO "notification" ("id", "recipientEmail", "senderName", "senderEmail", "type", "postId", "postContent", "message", "read", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          id,
          input.recipientEmail,
          input.senderName,
          input.senderEmail || null,
          input.type,
          input.postId || null,
          input.postContent || null,
          input.message,
          false,
          now,
          now,
        ]
      );

      return {
        ...newNotifData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
  }

  public async markAsRead(id: string): Promise<{ success: boolean }> {
    try {
      await db
        .update(notificationTable)
        .set({ read: true, updatedAt: new Date() })
        .where(eq(notificationTable.id, id));
    } catch (err) {
      logger.info(
        'Falling back to pool update for markAsRead: ' +
          (err instanceof Error ? err.message : String(err))
      );
      const res = await pool.query('UPDATE "notification" SET "read" = true, "updatedAt" = NOW() WHERE "id" = $1', [
        id,
      ]);
      if (res.rowCount === 0) {
        throw ApiError.notFound(`Notification '${id}' not found`);
      }
    }
    return { success: true };
  }

  public async markAllAsRead(recipientEmail: string): Promise<{ success: boolean }> {
    try {
      await db
        .update(notificationTable)
        .set({ read: true, updatedAt: new Date() })
        .where(eq(notificationTable.recipientEmail, recipientEmail));
    } catch (err) {
      logger.info(
        'Falling back to pool update for markAllAsRead: ' +
          (err instanceof Error ? err.message : String(err))
      );
      await pool.query(
        'UPDATE "notification" SET "read" = true, "updatedAt" = NOW() WHERE "recipientEmail" = $1',
        [recipientEmail]
      );
    }
    return { success: true };
  }
}
