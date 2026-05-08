import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function connectRedis(): Promise<void> {
  redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  redisClient.on('error', (err) => logger.error('Redis error:', err));
  await redisClient.connect();
}

export function getRedisClient() {
  return redisClient;
}
