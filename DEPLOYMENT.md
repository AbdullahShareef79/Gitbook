# DevSocial Production Deployment Runbook

## 🚀 Quick Deploy (30 minutes)

### Prerequisites
- Fly.io CLI: `curl -L https://fly.io/install.sh | sh`
- Fly account: `fly auth signup` or `fly auth login`
- Neon/Supabase account for PostgreSQL

---

## Step 1: Database Setup (5 min)

### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Create new project: `devsocial-prod`
3. Copy connection string (starts with `postgresql://`)
4. Enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Option B: Supabase
1. Go to https://supabase.com
2. Create project
3. In SQL Editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy Postgres connection string from Settings > Database

---

## Step 2: Deploy API (10 min)

```bash
cd apps/api

# Initialize Fly app (first time only)
fly launch --name devsocial-api --region iad --no-deploy

# Set secrets
fly secrets set \
  DATABASE_URL="postgresql://user:pass@host/db" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  GITHUB_ID="Ov23liJ9jxGnJPVPPCW3" \
  GITHUB_SECRET="55cf7cbc63aea2c0c68a8f192ec7a3a32778fbc9" \
  OPENAI_API_KEY="sk-..." \
  STRIPE_SECRET_KEY="sk_test_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  ALLOWED_ORIGINS="https://yourdomain.vercel.app"

# Run migrations against production DB
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Deploy
fly deploy

# Verify
fly status
curl https://devsocial-api.fly.dev/health
```

---

## Step 3: Deploy Collaboration Server (5 min)

```bash
cd apps/collab

# Initialize
fly launch --name devsocial-collab --region iad --no-deploy

# Deploy
fly deploy

# Verify
fly status
# Test with: wscat -c wss://devsocial-collab.fly.dev/test
```

---

## Step 4: Deploy Web (Vercel) (10 min)

### Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import GitHub repo
3. Set Root Directory: `apps/web`
4. Framework Preset: Next.js
5. Add Environment Variables:

```bash
NEXTAUTH_URL=https://yourdomain.vercel.app
NEXTAUTH_SECRET=<same-as-api>
GITHUB_ID=Ov23liJ9jxGnJPVPPCW3
GITHUB_SECRET=55cf7cbc63aea2c0c68a8f192ec7a3a32778fbc9
NEXT_PUBLIC_API_URL=https://devsocial-api.fly.dev
NEXT_PUBLIC_COLLAB_WS_URL=wss://devsocial-collab.fly.dev
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

### Via CLI
```bash
cd apps/web
vercel --prod
# Follow prompts, set env vars when asked
```

---

## Step 5: Update GitHub OAuth Callback (2 min)

1. Go to https://github.com/settings/developers
2. Edit your OAuth App
3. Update **Authorization callback URL**:
   ```
   https://yourdomain.vercel.app/api/auth/callback/github
   ```
4. Save

---

## Step 6: Smoke Tests (3 min)

```bash
# Health check
curl https://devsocial-api.fly.dev/health

# API test
curl -X POST https://devsocial-api.fly.dev/projects/from-github \
  -H "Content-Type: application/json" \
  -d '{"githubUrl":"https://github.com/vercel/next.js"}'

# Web test (manual)
# 1. Open https://yourdomain.vercel.app
# 2. Click "Sign In" → GitHub OAuth
# 3. Create a repo card
# 4. Join a code jam
# 5. Test real-time editing
```

---

## 📊 Monitoring Setup (Optional, 15 min)

### Sentry Error Tracking

**API:**
```bash
cd apps/api
pnpm add @sentry/nestjs

# In main.ts, before bootstrap():
import * as Sentry from '@sentry/nestjs';
Sentry.init({ dsn: process.env.SENTRY_DSN });

fly secrets set SENTRY_DSN="https://..."
fly deploy
```

**Web:**
```bash
cd apps/web
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Add to Vercel env:
SENTRY_DSN=https://...
```

### Uptime Monitoring
- Add https://devsocial-api.fly.dev/health to UptimeRobot
- Set alert email

---

## 🔄 Daily Operations

### View Logs
```bash
fly logs -a devsocial-api
fly logs -a devsocial-collab
vercel logs <deployment-url>
```

### Scale API (if needed)
```bash
fly scale count 2 -a devsocial-api  # 2 instances
fly scale memory 1024 -a devsocial-api  # 1GB RAM
```

### Database Backups
- Neon: Automatic hourly + daily
- Manual: `pg_dump $DATABASE_URL > backup.sql`

### Rollback
```bash
fly releases -a devsocial-api
fly rollback <version> -a devsocial-api
```

---

## 🔐 Security Checklist

- [ ] Rotate JWT_SECRET and NEXTAUTH_SECRET from defaults
- [ ] Set ALLOWED_ORIGINS to production domain only
- [ ] Enable Vercel Password Protection for beta
- [ ] Add rate limiting (npm: express-rate-limit)
- [ ] Review GitHub OAuth scopes (minimize to read:user)
- [ ] Set up STRIPE_WEBHOOK_SECRET endpoint signing

---

## 💰 Cost Estimate (MVP Launch)

| Service | Plan | Cost |
|---------|------|------|
| Fly.io API | 512MB, 1 instance | ~$5/mo |
| Fly.io Collab | 256MB, 1 instance | ~$3/mo |
| Vercel | Hobby | $0 |
| Neon | Free tier | $0 |
| **Total** | | **~$8/mo** |

Scale to 100 users: ~$20/mo
Scale to 1000 users: ~$50-80/mo

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Verify DATABASE_URL secret: `fly secrets list -a devsocial-api`
- Check Neon console for active connections
- Test locally: `psql $DATABASE_URL -c "SELECT 1"`

### "CORS error in browser"
- Check ALLOWED_ORIGINS includes your Vercel domain
- Verify Vercel deployment URL matches NEXTAUTH_URL
- Clear browser cache

### "WebSocket connection failed"
- Verify wss:// (not ws://) for production
- Check collab server status: `fly status -a devsocial-collab`
- Test with wscat: `wscat -c wss://devsocial-collab.fly.dev/test`

### "Prisma Client generation failed"
- Rebuild with engines: `fly deploy --no-cache -a devsocial-api`
- Check Dockerfile copies .prisma folder

### "GitHub OAuth not working"
- Verify callback URL matches exactly (trailing slashes matter)
- Check GITHUB_ID/SECRET are set in Vercel
- Ensure NEXTAUTH_URL matches deployment domain

---

## 📞 Support Contacts

- Fly.io: https://fly.io/docs
- Vercel: https://vercel.com/support
- Neon: https://neon.tech/docs
- Your email: [your-email@domain.com]

---

## 🎯 Next: Launch Checklist

After successful deployment:

1. [ ] Seed production DB with demo data
2. [ ] Create landing page with waitlist
3. [ ] Set up analytics (PostHog/Plausible)
4. [ ] Write launch tweet + Product Hunt post
5. [ ] Invite 10 alpha testers
6. [ ] Schedule first Friday Night Code Jam
7. [ ] Set up customer support (Discord/email)
8. [ ] Document API for marketplace creators

---

**You're now live! 🚀**

Monitor your first week closely. Check logs daily, respond to issues within 2 hours, and iterate based on user feedback.
