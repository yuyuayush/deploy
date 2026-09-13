import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';
import { ApiResponse } from '../../utils/api-response.js';
import { HttpStatus } from '../../constants/http-status.js';

const notificationService = new NotificationService();

export class NotificationController {
  public async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email : undefined;
      const notifications = await notificationService.getNotificationsForUser(email);
      ApiResponse.success(
        res,
        notifications,
        'Notifications retrieved successfully',
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      ApiResponse.success(
        res,
        { id, read: true },
        'Notification marked as read',
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipientEmail = (req.body?.recipientEmail || req.query.email) as string;
      if (!recipientEmail) {
        ApiResponse.error(res, 'recipientEmail is required', HttpStatus.BAD_REQUEST);
        return;
      }

      await notificationService.markAllAsRead(recipientEmail);
      ApiResponse.success(
        res,
        { recipientEmail, readAll: true },
        'All notifications marked as read',
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  }
}
