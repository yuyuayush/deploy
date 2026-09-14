import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { db, pool } from '../db/index.js';
import { unsubscribe as unsubscribeTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export interface WelcomeEmailInput {
  email: string;
  name: string;
}

export interface PostLikeEmailInput {
  recipientEmail: string;
  recipientName: string;
  likerName: string;
  postContent: string;
  postId: string;
}

// In-memory set for rapid lookup and offline fallback
const unsubscribedSet = new Set<string>();

export class EmailService {
  /**
   * Checks whether a user email has unsubscribed from notifications
   */
  public async isUnsubscribed(email: string): Promise<boolean> {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    if (unsubscribedSet.has(normalized)) return true;

    try {
      const [record] = await db
        .select()
        .from(unsubscribeTable)
        .where(eq(unsubscribeTable.email, normalized));
      if (record) {
        unsubscribedSet.add(normalized);
        return true;
      }
    } catch {
      try {
        const res = await pool.query('SELECT 1 FROM "unsubscribe" WHERE "email" = $1', [
          normalized,
        ]);
        if (res.rowCount && res.rowCount > 0) {
          unsubscribedSet.add(normalized);
          return true;
        }
      } catch {
        // Table might not exist yet, fallback to false
      }
    }
    return false;
  }

  /**
   * Registers a user unsubscription
   */
  public async addUnsubscription(email: string, reason?: string): Promise<boolean> {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    unsubscribedSet.add(normalized);

    const id = `unsub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    try {
      await db
        .insert(unsubscribeTable)
        .values({
          id,
          email: normalized,
          reason: reason || 'User requested unsubscription',
          createdAt: now,
        })
        .onConflictDoNothing();
      logger.info(`[UNSUBSCRIBE REGISTRY] Registered unsubscription for ${normalized}`);
      return true;
    } catch {
      try {
        await pool.query(
          'CREATE TABLE IF NOT EXISTS "unsubscribe" ("id" text PRIMARY KEY, "email" text UNIQUE NOT NULL, "reason" text, "createdAt" timestamp DEFAULT NOW())'
        );
        await pool.query(
          'INSERT INTO "unsubscribe" ("id", "email", "reason", "createdAt") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [id, normalized, reason || 'User requested unsubscription', now]
        );
        logger.info(`[UNSUBSCRIBE REGISTRY] Registered unsubscription via pool for ${normalized}`);
        return true;
      } catch (err) {
        logger.error(
          `[UNSUBSCRIBE REGISTRY ERROR] Failed to save unsubscription for ${normalized}: ${err}`
        );
      }
    }
    return true;
  }

  /**
   * Generates a sleek, high-end HTML email template for new user welcome notifications
   */
  private generateWelcomeTemplate(name: string, email: string): string {
    const baseUrl = env.CORS_ORIGIN || 'http://localhost:3000';
    const unsubUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #07080c; color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #0c1017; border: 1px solid #1e293b; border-radius: 16px; padding: 40px; }
          .logo { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 24px; }
          .logo span { color: #6366f1; }
          h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
          .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; margin-top: 20px; }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
          .footer a { color: #818cf8; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Better <span>Auth</span></div>
          <h1>Welcome to NextEngine Architecture, ${name}! 🚀</h1>
          <p>We are thrilled to have you join our developer community platform.</p>
          <p>Your account is now fully active and securely synchronized to our Neon PostgreSQL database via Better Auth authentication matrix.</p>
          <a href="${baseUrl}" class="button">Explore Feed & Dashboard</a>
          <div class="footer">
            <p>Sent by NextEngine Architecture • Better Auth & Neon DB</p>
            <p><a href="${unsubUrl}">Unsubscribe from email notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates a sleek HTML email template for post like notifications
   */
  private generatePostLikeTemplate(input: PostLikeEmailInput): string {
    const previewText =
      input.postContent.length > 80
        ? input.postContent.substring(0, 80) + '...'
        : input.postContent;
    const baseUrl = env.CORS_ORIGIN || 'http://localhost:3000';
    const unsubUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(input.recipientEmail)}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #07080c; color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #0c1017; border: 1px solid #1e293b; border-radius: 16px; padding: 40px; }
          .logo { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 24px; }
          .logo span { color: #f43f5e; }
          h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; }
          .highlight { color: #f43f5e; font-weight: 700; }
          .quote-box { background-color: #161e2e; border-left: 4px solid #f43f5e; padding: 16px; border-radius: 8px; margin: 20px 0; color: #cbd5e1; font-style: italic; font-size: 14px; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
          .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; margin-top: 20px; }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
          .footer a { color: #f43f5e; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">NextEngine <span>Feed</span></div>
          <h1>Hey ${input.recipientName}! ❤️</h1>
          <p><span class="highlight">${input.likerName}</span> just liked your post on the community feed!</p>
          <div class="quote-box">"${previewText}"</div>
          <a href="${baseUrl}/feed" class="button">View Post & Feed</a>
          <div class="footer">
            <p>Sent by NextEngine Architecture • BullMQ & Resend Notifications</p>
            <p><a href="${unsubUrl}">Unsubscribe from email notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates a sleek HTML email template for 1-minute delayed testing email
   */
  private generateDelayedTestTemplate(name: string, email: string): string {
    const baseUrl = env.CORS_ORIGIN || 'http://localhost:3000';
    const unsubUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #07080c; color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #0c1017; border: 1px solid #1e293b; border-radius: 16px; padding: 40px; }
          .logo { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 24px; }
          .logo span { color: #10b981; }
          .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; }
          p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
          .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; margin-top: 20px; }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
          .footer a { color: #34d399; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">⏱️ 1-Minute Scheduled Email Test</div>
          <div class="logo">NextEngine <span>Test Notification</span></div>
          <h1>Hello ${name}! 👋</h1>
          <p>This is your requested 1-minute delayed testing email, dispatched automatically via NextEngine BullMQ delayed queue!</p>
          <p>Everything is operating smoothly in your production & development pipeline.</p>
          <a href="${baseUrl}" class="button">Return to Dashboard</a>
          <div class="footer">
            <p>Sent by NextEngine Architecture • BullMQ & Resend Notifications</p>
            <p><a href="${unsubUrl}">Unsubscribe from email notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Dispatches welcome email via Resend API
   */
  public async sendWelcomeEmail(input: WelcomeEmailInput): Promise<boolean> {
    if (await this.isUnsubscribed(input.email)) {
      logger.info(`[EMAIL SKIPPED] User ${input.email} is unsubscribed. Skipping welcome email.`);
      return false;
    }

    const fromEmail = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = this.generateWelcomeTemplate(input.name, input.email);
    const subject = `Welcome to NextEngine Architecture, ${input.name}! 🚀`;

    if (env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: input.email,
            subject,
            html: htmlContent,
          }),
        });

        const data = (await res.json()) as Record<string, unknown>;

        if (res.ok) {
          logger.info(
            `[RESEND SUCCESS] Welcome email delivered to ${input.email} (ID: ${data.id})`
          );
          return true;
        }

        logger.error(`[RESEND FAILURE] Resend API error: ${JSON.stringify(data)}`);
        throw new Error(`Resend API Error: ${JSON.stringify(data)}`);
      } catch (error: unknown) {
        logger.error(`[RESEND ERROR] Failed to send via Resend: ${String(error)}`);
        throw error;
      }
    }

    // Simulation mode if no key provided
    logger.info(
      `[RESEND SIMULATION] (No active API key) Simulated welcome email to ${input.email} for ${input.name}`
    );
    return true;
  }

  /**
   * Dispatches post like notification email via Resend API
   */
  public async sendPostLikeEmail(input: PostLikeEmailInput): Promise<boolean> {
    if (await this.isUnsubscribed(input.recipientEmail)) {
      logger.info(
        `[EMAIL SKIPPED] User ${input.recipientEmail} is unsubscribed. Skipping post like email.`
      );
      return false;
    }

    const fromEmail = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = this.generatePostLikeTemplate(input);
    const subject = `🔥 ${input.likerName} liked your post on NextEngine!`;

    if (env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: input.recipientEmail,
            subject,
            html: htmlContent,
          }),
        });

        const data = (await res.json()) as Record<string, unknown>;

        if (res.ok) {
          logger.info(
            `[RESEND SUCCESS] Post like email delivered to ${input.recipientEmail} (ID: ${data.id})`
          );
          return true;
        }

        logger.error(`[RESEND FAILURE] Resend API error: ${JSON.stringify(data)}`);
        throw new Error(`Resend API Error: ${JSON.stringify(data)}`);
      } catch (error: unknown) {
        logger.error(`[RESEND ERROR] Failed to send post like email via Resend: ${String(error)}`);
        throw error;
      }
    }

    // Simulation mode if no key provided
    logger.info(
      `[RESEND SIMULATION] Simulated post like email to ${input.recipientEmail} (${input.likerName} liked post)`
    );
    return true;
  }

  /**
   * Dispatches 1-minute delayed testing email via Resend API
   */
  public async sendDelayedTestEmail(input: WelcomeEmailInput): Promise<boolean> {
    if (await this.isUnsubscribed(input.email)) {
      logger.info(
        `[EMAIL SKIPPED] User ${input.email} is unsubscribed. Skipping delayed test email.`
      );
      return false;
    }

    const fromEmail = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = this.generateDelayedTestTemplate(input.name, input.email);
    const subject = `⏱️ 1-Minute Scheduled Email Test for ${input.name}`;

    if (env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith('re_')) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: input.email,
            subject,
            html: htmlContent,
          }),
        });

        const data = (await res.json()) as Record<string, unknown>;

        if (res.ok) {
          logger.info(
            `[RESEND SUCCESS] Delayed test email delivered to ${input.email} (ID: ${data.id})`
          );
          return true;
        }

        logger.error(`[RESEND FAILURE] Resend API error: ${JSON.stringify(data)}`);
        throw new Error(`Resend API Error: ${JSON.stringify(data)}`);
      } catch (error: unknown) {
        logger.error(
          `[RESEND ERROR] Failed to send delayed test email via Resend: ${String(error)}`
        );
        throw error;
      }
    }

    // Simulation mode if no key provided
    logger.info(
      `[RESEND SIMULATION] Simulated 1-minute delayed test email to ${input.email} (${input.name})`
    );
    return true;
  }
}
