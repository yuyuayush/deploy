import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('8080')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT must be a valid port number (1-65535)',
    }),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000')
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),

  // Database Connection
  DATABASE_URL: z
    .string()
    .default(
      'postgresql://neondb_owner:npg_2JNqDRV3mBcA@ep-tiny-glitter-ay6hq98s.c-5.us-east-2.aws.neon.tech/neondb?sslmode=verify-full'
    ),

  // Better Auth Configuration
  BETTER_AUTH_SECRET: z.string().default('UGiHIhBZiD2e8aBaIi3cZ56k5pYCrIbL'),
  BETTER_AUTH_URL: z.string().default('http://localhost:8080'),

  // Google OAuth Credentials
  GOOGLE_CLIENT_ID: z.string().default('sample_google_client_id.apps.googleusercontent.com'),
  GOOGLE_CLIENT_SECRET: z.string().default('sample_google_client_secret'),

  // Redis & BullMQ Configuration
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  // Resend Email Configuration
  RESEND_API_KEY: z.string().optional().default(''),
  RESEND_FROM_EMAIL: z.string().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables configuration:');
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
