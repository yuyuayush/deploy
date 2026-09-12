import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

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

export class EmailService {
  /**
   * Generates a sleek, high-end HTML email template for new user welcome notifications
   */
  private generateWelcomeTemplate(name: string): string {
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
          .footer { margin-top: 32px; pt-24px; border-t: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Better <span>Auth</span></div>
          <h1>Welcome to NextEngine Architecture, ${name}! 🚀</h1>
          <p>We are thrilled to have you join our developer community platform.</p>
          <p>Your account is now fully active and securely synchronized to our Neon PostgreSQL database via Better Auth authentication matrix.</p>
          <a href="${env.CORS_ORIGIN || 'http://localhost:3000'}" class="button">Explore Feed & Dashboard</a>
          <div class="footer">
            <p>Sent by NextEngine Architecture • Better Auth & Neon DB</p>
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
    const previewText = input.postContent.length > 80 ? input.postContent.substring(0, 80) + '...' : input.postContent;
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
          .footer { margin-top: 32px; pt-24px; border-t: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">NextEngine <span>Feed</span></div>
          <h1>Hey ${input.recipientName}! ❤️</h1>
          <p><span class="highlight">${input.likerName}</span> just liked your post on the community feed!</p>
          <div class="quote-box">"${previewText}"</div>
          <a href="${env.CORS_ORIGIN || 'http://localhost:3000'}/feed" class="button">View Post & Feed</a>
          <div class="footer">
            <p>Sent by NextEngine Architecture • BullMQ & Resend Notifications</p>
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
    const fromEmail = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const htmlContent = this.generateWelcomeTemplate(input.name);
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
          logger.info(`[RESEND SUCCESS] Welcome email delivered to ${input.email} (ID: ${data.id})`);
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
          logger.info(`[RESEND SUCCESS] Post like email delivered to ${input.recipientEmail} (ID: ${data.id})`);
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
}

