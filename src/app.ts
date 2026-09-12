import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { httpLogger } from './middlewares/logger.middleware.js';
import { globalRateLimiter } from './middlewares/rate-limiter.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';
import { healthRouter } from './modules/health/health.router.js';

export const createApp = (): Application => {
  const app: Application = express();

  // 1. Security Headers & CORS Configuration
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors(corsOptions));

  // 2. Better Auth Route Handler (Must be mounted before body parsers)
  app.all('/api/auth/*', toNodeHandler(auth));
  app.all('/api/v1/auth/*', toNodeHandler(auth));

  // 3. Global Rate Limiter & Body Parsers
  app.use(globalRateLimiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(httpLogger);
  }

  // 5. Healthcheck Route
  app.use('/health', healthRouter);

  // 6. Centralized API v1 Routes
  app.use(env.API_PREFIX, apiRouter);

  // 7. 404 & Centralized Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
