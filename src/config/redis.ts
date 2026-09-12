import { env } from './env.js';

/**
 * Parses REDIS_URL into Redis Options for BullMQ & ioredis
 * Supports local redis:// as well as Cloud Redis (Upstash, Redis Labs, Render, Aiven rediss:// with SSL/TLS)
 */
export function getRedisConnectionOptions() {
  let rawUrl = env.REDIS_URL || 'redis://127.0.0.1:6379';

  // Automatically clean CLI prefixes if accidentally pasted
  if (rawUrl.startsWith('redis-cli -u ')) {
    rawUrl = rawUrl.replace('redis-cli -u ', '').trim();
  }

  try {
    const parsed = new URL(rawUrl);
    const isTls = parsed.protocol === 'rediss:';

    return {
      host: parsed.hostname || '127.0.0.1',
      port: parsed.port ? parseInt(parsed.port, 10) : isTls ? 6380 : 6379,
      username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        // Prevent endless local reconnect attempts if local Redis server is not installed
        if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
          if (times > 1) return null;
        }
        return Math.min(times * 100, 3000);
      },
    };
  } catch {
    return {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: () => null,
    };
  }
}
