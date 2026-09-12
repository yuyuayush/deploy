import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { env } from '../config/env.js';

/**
 * Backend Better Auth Instance integrated with Drizzle ORM & Neon PostgreSQL
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'],
      trustedProxies: ['127.0.0.1', '::1'],
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000',env.CORS_ORIGIN],
});
