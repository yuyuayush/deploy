import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  logger.info(`API Endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
  logger.info(`Healthcheck:  http://localhost:${env.PORT}/health`);
});

// Graceful Shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed successfully.');
    process.exit(0);
  });

  // Force close process after 10 seconds if connections don't drain
  setTimeout(() => {
    logger.error('Forced shutdown: Timed out waiting for connections to close.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
  logger.error(reason, 'Unhandled Promise Rejection caught');
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal(error, 'Uncaught Exception caught. Shutting down process...');
  process.exit(1);
});
