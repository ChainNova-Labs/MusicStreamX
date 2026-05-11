import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Get a cached value. Returns null on cache miss or Redis unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (err) {
    logger.warn(`Cache GET failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Set a cached value with a TTL in seconds. Silently fails if Redis is unavailable.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn(`Cache SET failed for key "${key}":`, err);
  }
}

/**
 * Delete a cached key. Silently fails if Redis is unavailable.
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch (err) {
    logger.warn(`Cache DEL failed for key "${key}":`, err);
  }
}

// TTL constants (seconds)
export const TTL = {
  TOP_TRACKS: 300,      // 5 min — changes with each stream
  ARTIST_PROFILE: 600,  // 10 min — changes infrequently
  PLATFORM_STATS: 60,   // 1 min — high-frequency aggregate
} as const;
