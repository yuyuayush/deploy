import { Request, Response, NextFunction } from 'express';
import { AudienceService } from './audience.service.js';
import { ApiResponse } from '../../utils/api-response.js';
import { HttpStatus } from '../../constants/http-status.js';

const audienceService = new AudienceService();

export class AudienceController {
  public async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, frequency } = req.body || {};
      if (!email || typeof email !== 'string') {
        ApiResponse.error(res, 'Email address is required', HttpStatus.BAD_REQUEST);
        return;
      }

      const subscriber = await audienceService.subscribe({ email, name, frequency });
      ApiResponse.success(
        res,
        subscriber,
        'Subscribed successfully! Check your inbox for daily updates.',
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email : undefined;
      if (!email) {
        const count = await audienceService.getSubscriberCount();
        ApiResponse.success(res, { count }, 'Audience count retrieved successfully', HttpStatus.OK);
        return;
      }

      const subscriber = await audienceService.getSubscriberStatus(email);
      const count = await audienceService.getSubscriberCount();
      ApiResponse.success(
        res,
        { isSubscribed: Boolean(subscriber && subscriber.status === 'active'), subscriber, count },
        'Subscription status retrieved',
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body || {};
      const targetEmail =
        typeof email === 'string'
          ? email
          : typeof req.query.email === 'string'
            ? req.query.email
            : undefined;

      if (!targetEmail) {
        ApiResponse.error(res, 'Email is required to unsubscribe', HttpStatus.BAD_REQUEST);
        return;
      }

      await audienceService.unsubscribe(targetEmail);
      ApiResponse.success(
        res,
        { email: targetEmail, unsubscribed: true },
        'Unsubscribed successfully from daily updates',
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !subject || !message) {
        ApiResponse.error(
          res,
          'Name, Email, Subject, and Message are required',
          HttpStatus.BAD_REQUEST
        );
        return;
      }

      const contact = await audienceService.submitContactMessage({ name, email, subject, message });
      ApiResponse.success(
        res,
        contact,
        'Thank you! Your message has been received.',
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  public async triggerDailyQuotes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dispatchDailyQuotesNow } = await import('../../jobs/daily-quote.cron.js');
      const result = await dispatchDailyQuotesNow();
      ApiResponse.success(
        res,
        result,
        `Dispatched 8:00 AM daily quote email to ${result.count} active subscriber(s).`,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }
}
