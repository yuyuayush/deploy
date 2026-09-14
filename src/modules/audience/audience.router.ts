import { Router } from 'express';
import { AudienceController } from './audience.controller.js';

const router = Router();
const controller = new AudienceController();

/**
 * Audience & Daily Newsletter Router
 * Base Path: /api/v1/audience
 */
router.post('/subscribe', (req, res, next) => controller.subscribe(req, res, next));
router.get('/status', (req, res, next) => controller.getStatus(req, res, next));
router.post('/unsubscribe', (req, res, next) => controller.unsubscribe(req, res, next));
router.post('/contact', (req, res, next) => controller.submitContact(req, res, next));
router.post('/trigger-daily-quotes', (req, res, next) =>
  controller.triggerDailyQuotes(req, res, next)
);

export const audienceRouter = router;
