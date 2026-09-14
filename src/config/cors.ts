import { CorsOptions } from 'cors';
import { env } from './env.js';

const configuredOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : [];

export const allowedOrigins = Array.from(new Set([...configuredOrigins]));

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser requests (no origin header)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
    // Allow any Vercel domain or preview deployment (.vercel.app)
    const isVercel = /\.vercel\.app$/.test(origin);

    if (isAllowed || isVercel) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} blocked by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
};
