import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  transport: env.LOG_PRETTY
    ? {
        target: 'pino-pretty',
        options: {
          colorize: process.env.NODE_ENV !== 'production',
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: true,
        },
      }
    : undefined,
});
