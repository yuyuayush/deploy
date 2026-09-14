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

      // 7. Create notification table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "notification" (
          "id" text PRIMARY KEY NOT NULL,
          "recipientEmail" text NOT NULL,
          "senderName" text NOT NULL,
          "senderEmail" text,
          "type" text NOT NULL,
          "postId" text,
          "postContent" text,
          "message" text NOT NULL,
          "read" boolean DEFAULT false NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      // 8. Create unsubscribe table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "unsubscribe" (
          "id" text PRIMARY KEY NOT NULL,
          "email" text NOT NULL UNIQUE,
          "reason" text,
          "createdAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      // 9. Create subscriber table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "subscriber" (
          "id" text PRIMARY KEY NOT NULL,
          "email" text NOT NULL UNIQUE,
          "name" text DEFAULT 'Subscriber' NOT NULL,
          "frequency" text DEFAULT 'daily' NOT NULL,
          "status" text DEFAULT 'active' NOT NULL,
          "subscribedAt" timestamp DEFAULT now() NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL,
          "updatedAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      // 10. Create contact_message table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "contact_message" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "email" text NOT NULL,
          "subject" text NOT NULL,
          "message" text NOT NULL,
          "status" text DEFAULT 'unread' NOT NULL,
          "createdAt" timestamp DEFAULT now() NOT NULL
        );
      `);

      logger.info('✅ Neon PostgreSQL database schema successfully verified and synced!');
    } finally {
      client.release();
    }
  } catch (error) {
    logger.info(
      'ℹ️ Schema sync notice: ' + (error instanceof Error ? error.message : String(error))
    );
  }
}
