# Deployment Checklist for Kadan

## 🔒 Security Pre-Deployment

### Must Fix Before Going Live:
- [ ] **Fix rate limiter** - Replace in-memory Map with Vercel KV or Upstash Redis
- [ ] **Add security headers** to next.config.mjs
- [ ] **Configure CORS policy**
- [ ] **Set up production error logging** (Sentry, LogRocket, or similar)
- [ ] **Add request body size limits**
- [ ] **Review all console.log/error statements** - remove or replace with proper logging

### Environment Variables Checklist:
- [ ] Verify `.env.local` is NOT committed (check with `git status`)
- [ ] `.env.example` is committed and up-to-date
- [ ] All required env vars documented in `.env.example`

### Security Headers to Add:
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  // Limit request body size
  experimental: {
    bodySizeLimit: '1mb'
  }
};
```

## 🗄️ Database Backup Strategy

### Neon Built-in (Automatic):
- ✅ Point-in-time recovery (7 days on free tier, 30 days on Pro)
- ✅ Automatic daily snapshots
- ✅ Access via Neon console

### Manual Backup Options:

#### Option 1: Scheduled pg_dump (Recommended)
```bash
# Create backup script
mkdir -p backups
pg_dump $DATABASE_URL > backups/backup-$(date +%Y%m%d-%H%M%S).sql

# Add to cron or GitHub Actions for weekly backups
```

#### Option 2: Neon Database Branching
```bash
# Install Neon CLI
npm install -g neonctl

# Create a backup branch
neonctl branches create --name backup-$(date +%Y%m%d)
```

#### Option 3: Vercel Cron Job (After deployment)
Create a backup endpoint that runs weekly via Vercel Cron.

### 🔴 IMPORTANT - Backup Best Practices:
- [ ] Test backup restoration BEFORE going live
- [ ] Store backups in separate location (S3, Google Cloud Storage)
- [ ] Set up automated weekly backups
- [ ] Document restore procedure
- [ ] Enable Neon's point-in-time recovery

## 📦 GitHub Setup

### Before First Push:
- [ ] Review all files to be committed
- [ ] Ensure no secrets in code
- [ ] Check `.gitignore` is complete
- [ ] Add proper README.md
- [ ] Add LICENSE file (if applicable)

### Files to Review Before Commit:
```bash
# Check what will be committed
git status
git diff

# Search for potential secrets
git grep -i "password\|secret\|api_key\|token" --cached
```

### Git Commands:
```bash
# Initialize git (already done)
git init

# Add all files
git add .

# Review what's staged
git status

# Commit
git commit -m "Initial commit: Kadan productivity dashboard"

# Create GitHub repo (via GitHub CLI or web)
gh repo create kadan --public --source=. --remote=origin

# Or manually:
# 1. Create repo on github.com
# 2. git remote add origin https://github.com/YOUR_USERNAME/kadan.git

# Push to GitHub
git push -u origin main
```

## 🚀 Vercel Deployment

### Pre-Deployment:
- [ ] Commit all changes to git
- [ ] Push to GitHub
- [ ] Have Clerk credentials ready
- [ ] Have Neon database URL ready

### Deployment Steps:

#### 1. Install Vercel CLI (optional):
```bash
npm install -g vercel
```

#### 2. Deploy via Vercel Dashboard (Recommended for first deploy):
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

#### 3. Set Environment Variables in Vercel:
Go to Project Settings → Environment Variables and add:
- `DATABASE_URL` (from Neon)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from Clerk)
- `CLERK_SECRET_KEY` (from Clerk)

**For all environments: Production, Preview, Development**

#### 4. Deploy:
- Click "Deploy"
- Wait for build to complete
- Vercel will provide a URL

#### 5. Post-Deployment Verification:
- [ ] Visit the deployed URL
- [ ] Test authentication (sign up/sign in)
- [ ] Test creating tasks, habits, goals
- [ ] Check API endpoints work
- [ ] Test on mobile device
- [ ] Check browser console for errors

### 6. Clerk Configuration:
Update Clerk Dashboard with your Vercel URL:
- Add production domain to allowed origins
- Update redirect URLs

### 7. Custom Domain (Optional):
- Add custom domain in Vercel dashboard
- Update DNS records
- Update Clerk allowed origins

## 📊 Monitoring & Maintenance

### Set Up:
- [ ] Vercel Analytics (free)
- [ ] Error tracking (Sentry recommended)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up alerts for errors

### Regular Maintenance:
- [ ] Weekly: Check error logs
- [ ] Monthly: Review dependencies for updates
- [ ] Monthly: Test backup restoration
- [ ] Quarterly: Security audit

## 🔍 Security Considerations

### Hardcoded Project Names:
⚠️ Your validation schemas have hardcoded project names:
- "strachwitz", "chaunce", "private"

**Before deployment, decide**:
- [ ] Keep hardcoded (current approach - simpler)
- [ ] Make dynamic (add projects table - more flexible)

### API Exposure:
- [ ] All API routes are protected with authentication ✅
- [ ] Rate limiting is in place (needs Redis fix) ⚠️
- [ ] Input validation with Zod ✅

### Database Security:
- [ ] Row-level security enforced via userId checks ✅
- [ ] Cascade deletes configured ✅
- [ ] SSL required for database connection ✅

## 🐛 Known Issues to Address:

1. **Rate limiter**: In-memory, won't scale (HIGH PRIORITY)
2. **Error logging**: Using console.error (MEDIUM)
3. **No monitoring**: Add error tracking (MEDIUM)
4. **No backup automation**: Set up scheduled backups (MEDIUM)

## ✅ Final Pre-Launch Checklist:

- [ ] All security fixes implemented
- [ ] Environment variables configured in Vercel
- [ ] Backup strategy in place
- [ ] Error monitoring set up
- [ ] Documentation updated
- [ ] Test deployment successful
- [ ] Mobile testing complete
- [ ] Performance tested
- [ ] Analytics configured
- [ ] Clerk domain updated
