# Critical Security Fixes Required Before Deployment

## 1. Fix Rate Limiter (CRITICAL - HIGH PRIORITY)

### Problem
The current rate limiter uses an in-memory Map that:
- Resets on every server restart/redeploy
- Won't work across multiple Vercel serverless instances
- Data is lost between requests in serverless environment

### Solution: Use Vercel KV (Redis)

#### Step 1: Set up Vercel KV
```bash
# Install Vercel KV SDK
npm install @vercel/kv
```

#### Step 2: Create new rate-limit.ts

Replace `src/lib/rate-limit.ts` with:

```typescript
import { kv } from '@vercel/kv';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 100;

export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const now = Date.now();
  const key = `ratelimit:${userId}`;

  // Get current count
  const record = await kv.get<{ count: number; resetAt: number }>(key);

  if (!record || now > record.resetAt) {
    // Reset window
    const resetAt = now + WINDOW_MS;
    await kv.set(key, { count: 1, resetAt }, { px: WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  // Increment count
  const newCount = record.count + 1;
  await kv.set(key, { count: newCount, resetAt: record.resetAt }, {
    px: record.resetAt - now
  });

  if (newCount > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - newCount,
    resetAt: record.resetAt,
  };
}
```

#### Step 3: Configure in Vercel
1. Go to your Vercel project dashboard
2. Go to Storage → Create Database → KV
3. Connect to your project
4. Environment variables are automatically added

#### Alternative: Upstash Redis (Free Tier Available)
```bash
npm install @upstash/redis
```

```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function checkRateLimit(userId: string) {
  const key = `ratelimit:${userId}`;
  const window = 60 * 60; // 1 hour in seconds
  const limit = 100;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, window);
  }

  const ttl = await redis.ttl(key);
  const resetAt = Date.now() + (ttl * 1000);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}
```

Environment variables needed:
```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 2. Add Security Headers (CRITICAL)

Replace `next.config.mjs` with:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.com https://*.neon.tech wss://*.clerk.accounts.dev",
              "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  },

  // Limit request body size
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;
```

**Note**: You may need to adjust the CSP headers based on Clerk's actual domains. Test after deployment.

## 3. Improve Error Handling (MEDIUM PRIORITY)

### Problem
Console.error in production can leak sensitive information.

### Solution: Add Production Error Logger

#### Option 1: Sentry (Recommended)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Then update `src/lib/api-helpers.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

export async function withAuth(
  handler: (user: { id: string; clerkId: string }) => Promise<NextResponse>
) {
  try {
    const user = await requireUser();
    const { allowed, remaining, resetAt } = await checkRateLimit(user.id);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(resetAt).toISOString(),
          },
        }
      );
    }

    const response = await handler(user);
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    } else {
      console.error("API Error:", error);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Option 2: Simple Logger (No external service)

Create `src/lib/logger.ts`:

```typescript
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';

  if (process.env.NODE_ENV === 'production') {
    // In production, log structured data (can be sent to logging service)
    console.error(JSON.stringify({
      timestamp,
      level: 'error',
      context,
      message: errorMessage,
      // Don't log full stack in production to avoid leaking paths
      stack: process.env.DEBUG === 'true' ? stack : undefined,
    }));
  } else {
    // In development, log full details
    console.error(`[${timestamp}] ${context || 'Error'}:`, error);
  }
}
```

## 4. Add CORS Configuration (MEDIUM PRIORITY)

Add to `next.config.mjs`:

```javascript
async headers() {
  return [
    // ... existing headers
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.ALLOWED_ORIGIN || 'https://yourdomain.com'
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS'
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization'
        },
        {
          key: 'Access-Control-Max-Age',
          value: '86400'
        }
      ]
    }
  ];
}
```

## 5. Database Connection Optimization (MEDIUM PRIORITY)

Update `src/lib/db.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(connectionString, {
    ssl: "require",
    max: process.env.NODE_ENV === 'production' ? 1 : 10, // Serverless optimization
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Disable prepared statements in serverless
  });

  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
```

## 6. Environment Variable Validation (RECOMMENDED)

Create `src/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

Use in `src/lib/db.ts`:
```typescript
import { env } from './env';

const connectionString = env.DATABASE_URL;
```

## Summary Checklist

Before deploying:

- [ ] Install and configure Vercel KV or Upstash Redis
- [ ] Update rate-limit.ts to use Redis
- [ ] Add security headers to next.config.mjs
- [ ] Add request body size limits
- [ ] Set up error logging (Sentry or custom)
- [ ] Configure CORS policy
- [ ] Optimize database connection for serverless
- [ ] Add environment variable validation
- [ ] Test all changes locally
- [ ] Test deployment in preview environment
- [ ] Review all console.log/console.error statements
- [ ] Enable Vercel Analytics
- [ ] Set up uptime monitoring

## Testing Security Fixes

After implementing:

```bash
# Test build
npm run build

# Test production mode locally
npm run start

# Test rate limiting
curl -H "Cookie: your-auth-cookie" http://localhost:3000/api/tasks
# Make 101 requests to test rate limit

# Check security headers
curl -I https://your-deployment.vercel.app

# Or use online tools:
# - https://securityheaders.com
# - https://observatory.mozilla.org
```
