import { CorsOptions } from 'cors';
import { env } from './env.js';

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const configuredOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

export const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
};
