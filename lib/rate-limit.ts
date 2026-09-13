/**
 * A tiny in-memory sliding-window rate limiter for AI routes.
 *
 * This is deliberately simple: it protects a single server instance from a
 * user hammering the (paid, latency-heavy) chat endpoint. For multi-instance
 * production you'd back this with Redis or Supabase, but the interface stays
 * the same. Keyed by user id.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the window resets
}

/**
 * @param key      unique caller id (use the authenticated user id)
 * @param limit    max requests allowed per window (default 20)
 * @param windowMs window length in ms (default 60s)
 */
export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}
