import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { httpLogger } from './middlewares/logger.middleware.js';
import { globalRateLimiter } from './middlewares/rate-limiter.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { healthRouter } from './modules/health/health.router.js';
import { userRouter } from './modules/users/user.router.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security headers
  app.use(helmet());

  // CORS setup
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Rate Limiting
  app.use(globalRateLimiter);

  // Request body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(httpLogger);
  }

  // Base Health Check Route
  app.use('/health', healthRouter);

  // API v1 Routes
  const apiRouter = express.Router();
  apiRouter.use('/health', healthRouter);
  apiRouter.use('/users', userRouter);

  app.use(env.API_PREFIX, apiRouter);

  // Catch 404 for undefined routes
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
