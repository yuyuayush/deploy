import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { env } from './config/env.js';
import { httpLogger } from './middlewares/logger.middleware.js';
import { globalRateLimiter } from './middlewares/rate-limiter.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { healthRouter } from './modules/health/health.router.js';
import { userRouter } from './modules/users/user.router.js';
import { postRouter } from './modules/posts/post.router.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security headers
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS setup for Frontend Communication (local & production origins)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );

  // Better Auth Handler (MUST BE MOUNTED BEFORE JSON BODY PARSERS)
  app.all('/api/auth/*', toNodeHandler(auth));
  app.all('/api/v1/auth/*', toNodeHandler(auth));

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
  apiRouter.use('/posts', postRouter);

  app.use(env.API_PREFIX, apiRouter);

  // Catch 404 for undefined routes
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
