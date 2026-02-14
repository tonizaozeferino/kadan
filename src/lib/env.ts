import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Optional: Upstash Redis for rate limiting (required in production)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);

// Warn if Redis is not configured in production
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
) {
  console.warn(
    "⚠️  WARNING: Redis not configured in production. Rate limiting will not work properly. Please set up Upstash Redis integration in Vercel."
  );
}
