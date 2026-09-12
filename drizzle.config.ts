import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://neondb_owner:npg_2JNqDRV3mBcA@ep-tiny-glitter-ay6hq98s.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
  },
});
