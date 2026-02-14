const rateMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 100;

/**
 * Simple in-memory rate limiter.
 * Returns true if the request is allowed, false if rate-limited.
 */
export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateMap.get(userId);

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
