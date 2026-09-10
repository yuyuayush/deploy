import pino from 'pino';
import { createRequire } from 'module';
import { env } from '../config/env.js';

const require = createRequire(import.meta.url);

const getTransport = () => {
  if (env.NODE_ENV !== 'development') {
    return undefined;
  }

  try {
    require.resolve('pino-pretty');
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  } catch {
    return undefined;
  }
};

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: getTransport(),
});

