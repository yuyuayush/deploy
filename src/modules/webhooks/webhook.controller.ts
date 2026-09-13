import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../../services/email.service.js';
import { enqueueDelayedTestEmail } from '../../queues/email.queue.js';
import { ApiResponse } from '../../utils/api-response.js';
import { HttpStatus } from '../../constants/http-status.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

const emailService = new EmailService();

export class WebhookController {
  /**
   * Resend Webhook Event Handler (email.unsubscribed, email.bounced, email.delivered, etc.)
   */
  public async handleResendWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body || {};
      const type = payload.type || payload.event;
      const data = payload.data || payload;

      const svixSignature = req.headers['svix-signature'] || req.headers['x-resend-signature'];
      logger.info(
        `[WEBHOOK RECEIVED] Resend event '${type}' | Signature Header: ${svixSignature ? 'Present' : 'None'} | Secret configured: YES (${env.RESEND_WEBHOOK_SECRET ? 'whsec_***' : 'Missing'})`
      );

      if (type === 'email.unsubscribed' || type === 'email.bounced' || type === 'email.complained') {
        let emailToUnsub: string | null = null;
        if (Array.isArray(data?.to) && data.to.length > 0) {
          emailToUnsub = data.to[0];
        } else if (typeof data?.to === 'string') {
          emailToUnsub = data.to;
        } else if (typeof data?.email === 'string') {
          emailToUnsub = data.email;
        }

        if (emailToUnsub) {
          await emailService.addUnsubscription(emailToUnsub, `Resend webhook event: ${type}`);
          logger.info(`[WEBHOOK PROCESSED] Auto-unsubscribed ${emailToUnsub} via webhook ${type}`);
        }
      }

      res.status(200).json({ received: true, type });
    } catch (error) {
      next(error);
    }
  }

  /**
   * HTTP GET Unsubscribe endpoint (handles direct link clicks from emails)
   */
  public async handleUnsubscribeGet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email : undefined;
      if (!email) {
        ApiResponse.error(res, 'Email query parameter is required', HttpStatus.BAD_REQUEST);
        return;
      }

      await emailService.addUnsubscription(email, 'Direct email link click');

      const redirectUrl = `${env.CORS_ORIGIN || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}&status=success`;
      res.redirect(302, redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * HTTP POST Unsubscribe endpoint
   */
  public async handleUnsubscribePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.body?.email === 'string' ? req.body.email : undefined;
      const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;

      if (!email) {
        ApiResponse.error(res, 'email parameter is required', HttpStatus.BAD_REQUEST);
        return;
      }

      await emailService.addUnsubscription(email, reason);
      ApiResponse.success(
        res,
        { email, unsubscribed: true },
        'Successfully unsubscribed from email notifications',
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Triggers a 1-minute delayed testing email for a logged-in user
   */
  public async triggerTestEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.body?.email === 'string' ? req.body.email : undefined;
      const name = typeof req.body?.name === 'string' ? req.body.name : 'Developer';
      const delayMs = typeof req.body?.delayMs === 'number' ? req.body.delayMs : 60000;

      if (!email) {
        ApiResponse.error(res, 'email parameter is required', HttpStatus.BAD_REQUEST);
        return;
      }

      // Enqueue job with 60 second delay
      await enqueueDelayedTestEmail({ email, name }, delayMs);

      ApiResponse.success(
        res,
        { email, scheduledInSeconds: Math.round(delayMs / 1000) },
        `1-minute test email scheduled for ${email}. You will receive it in ${Math.round(delayMs / 1000)} seconds.`,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check unsubscription status for an email
   */
  public async checkUnsubscribeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email : undefined;
      if (!email) {
        ApiResponse.error(res, 'email parameter is required', HttpStatus.BAD_REQUEST);
        return;
      }

      const isUnsubbed = await emailService.isUnsubscribed(email);
      ApiResponse.success(
        res,
        { email, isUnsubscribed: isUnsubbed },
        `Subscription status checked for ${email}`,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }
}
