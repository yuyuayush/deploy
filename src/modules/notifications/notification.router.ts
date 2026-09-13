import { Router } from 'express';
import { NotificationController } from './notification.controller.js';

const router = Router();
const controller = new NotificationController();

router.get('/', (req, res, next) => controller.getNotifications(req, res, next));
router.patch('/read-all', (req, res, next) => controller.markAllAsRead(req, res, next));
router.patch('/:id/read', (req, res, next) => controller.markAsRead(req, res, next));

export const notificationRouter = router;
