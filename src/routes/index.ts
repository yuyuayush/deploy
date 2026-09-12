import { Router } from 'express';
import { healthRouter } from '../modules/health/health.router.js';
import { userRouter } from '../modules/users/user.router.js';
import { postRouter } from '../modules/posts/post.router.js';

const router = Router();

/**
 * Centralized API v1 Routes Registry
 */
router.use('/health', healthRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);

export const apiRouter = router;
