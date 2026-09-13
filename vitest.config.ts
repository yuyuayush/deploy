import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      API_PREFIX: '/api/v1',
      CORS_ORIGIN: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/neondb',
      BETTER_AUTH_SECRET: 'test_better_auth_secret_key_32chars',
      BETTER_AUTH_URL: 'http://localhost:8080',
      GOOGLE_CLIENT_ID: 'test_google_client_id',
      GOOGLE_CLIENT_SECRET: 'test_google_client_secret',
      REDIS_URL: 'redis://localhost:6379',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
