import { pinoHttp } from 'pino-http';
import { logger } from '../utils/logger.js';

/**
 * Clean HTTP logger middleware with disabled verbose req/res object dump
 */
export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} -> HTTP ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} -> HTTP ${res.statusCode} (${err.message})`;
  },
});
