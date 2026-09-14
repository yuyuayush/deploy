import { Router } from 'express';
import { WebhookController } from './webhook.controller.js';

const router = Router();
const controller = new WebhookController();

router.post('/resend', (req, res, next) => controller.handleResendWebhook(req, res, next));
router.get('/unsubscribe', (req, res, next) => controller.handleUnsubscribeGet(req, res, next));
router.post('/unsubscribe', (req, res, next) => controller.handleUnsubscribePost(req, res, next));
router.get('/unsubscribe/check', (req, res, next) =>
  controller.checkUnsubscribeStatus(req, res, next)
);
router.post('/trigger-test-email', (req, res, next) => controller.triggerTestEmail(req, res, next));

export const webhookRouter = router;
