import { pool } from './index.js';
import { logger } from '../utils/logger.js';

export async function runMigrations() {
  try {
    logger.info('🔄 Verifying and syncing Neon PostgreSQL schema for Better Auth & Posts...');

    const client = await pool.connect();
    try {
      // 1. Create user table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "user" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "email" text NOT NULL UNIQUE,
          "emailVerified" boolean DEFAULT false NOT NULL,
          "image" text,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      // 2. Create session table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "id" text PRIMARY KEY NOT NULL,
          "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
          "token" text NOT NULL UNIQUE,
          "expiresAt" timestamp NOT NULL,
          "ipAddress" text,
          "userAgent" text,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      // 3. Create account table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "account" (
          "id" text PRIMARY KEY NOT NULL,
          "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
          "accountId" text NOT NULL,
          "providerId" text NOT NULL,
          "accessToken" text,
          "refreshToken" text,
          "accessTokenExpiresAt" timestamp,
          "refreshTokenExpiresAt" timestamp,
          "scope" text,
          "idToken" text,
          "password" text,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      // 4. Ensure idToken column exists if account table was previously created without it
      await client.query(`
        ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idToken" text;
      `);

      // 5. Create verification table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "verification" (
          "id" text PRIMARY KEY NOT NULL,
          "identifier" text NOT NULL,
          "value" text NOT NULL,
          "expiresAt" timestamp NOT NULL,
          "createdAt" timestamp DEFAULT now(),
          "updatedAt" timestamp DEFAULT now()
        );
      `);

      // 6. Create post table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "post" (
          "id" text PRIMARY KEY NOT NULL,
          "authorName" text NOT NULL,
          "authorRole" text DEFAULT 'user' NOT NULL,
          "authorEmail" text NOT NULL,
          "content" text NOT NULL,
          "likes" integer DEFAULT 0 NOT NULL,
          "commentsCount" integer DEFAULT 0 NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      logger.info('✅ Neon PostgreSQL database schema successfully verified and synced!');
    } finally {
      client.release();
    }
  } catch (error) {
    logger.info('ℹ️ Schema sync notice: ' + (error instanceof Error ? error.message : String(error)));
  }
}
