import { Redis } from "@upstash/redis";

const WINDOW_SECONDS = 60 * 60; // 1 hour
const MAX_REQUESTS = 100;

// Initialize Redis client (will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
// Falls back to in-memory for development if Redis env vars not set
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (error) {
  console.warn("Redis not configured, falling back to in-memory rate limiting (dev only)");
}

// Fallback in-memory map for development
const rateMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Production-ready rate limiter using Upstash Redis.
 * Falls back to in-memory for development if Redis is not configured.
 */
export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  // Use Redis in production
  if (redis) {
    const key = `ratelimit:${userId}`;

    try {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, WINDOW_SECONDS);
      }

      const ttl = await redis.ttl(key);
      const resetAt = Date.now() + (ttl * 1000);

      return {
        allowed: count <= MAX_REQUESTS,
        remaining: Math.max(0, MAX_REQUESTS - count),
        resetAt,
      };
    } catch (error) {
      console.error("Redis rate limit error:", error);
      // Fail open - allow request if Redis fails
      return {
        allowed: true,
        remaining: MAX_REQUESTS,
        resetAt: Date.now() + WINDOW_SECONDS * 1000,
      };
    }
  }

  // Fallback to in-memory for development
  const now = Date.now();
  const record = rateMap.get(userId);
  const WINDOW_MS = WINDOW_SECONDS * 1000;

  if (!record || now > record.resetAt) {
    rateMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetAt: record.resetAt,
  };
}
