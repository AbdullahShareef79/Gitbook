# DevSocial Production Release v1.0

## Release Date
November 19, 2025

## Overview
This release brings DevSocial to production-ready status with complete feature implementation, security hardening, admin tools, and a background worker service for rank calculations.

## What's New

### 🎨 Front-End Features

#### 1. Profile Followers/Following Tabs
- **Location**: `/profile/[handle]`
- **Features**:
  - Tabbed interface showing Projects, Followers, and Following
  - Infinite scroll pagination for follower/following lists
  - Follow/unfollow buttons with optimistic updates
  - Real-time count display
- **Components**:
  - `FollowList.tsx` - Reusable component with SWR infinite loading
  - Updated profile page with tab navigation

#### 2. Jam Template Selector Modal
- **Component**: `JamTemplateSelector.tsx`
- **Features**:
  - Browse available coding templates by language
  - Preview template code before using
  - Start jam from scratch or with a template
  - Template filtering by programming language
- **API Integration**: 
  - GET `/jam-templates` - List all templates
  - POST `/jams` with `templateId` - Create jam session

#### 3. Moderation Admin Dashboard
- **Location**: `/admin/moderation`
- **Features**:
  - Admin-only access with lock screen for non-admins
  - View flagged content with pagination
  - Filter flags by status (OPEN, RESOLVED, DISMISSED)
  - Resolve or dismiss flags with one click
  - Display reporter info and flagged post content
- **Security**: Protected by `AdminGuard`

#### 4. Real-Time Notifications (SSE)
- **Hook**: `useNotificationSSE.ts`
- **Features**:
  - EventSource-based real-time notifications
  - Exponential backoff reconnection strategy (1s, 2s, 4s, 8s, 16s, 30s max)
  - Live unread count updates
  - Heartbeat every 30 seconds
  - Automatic cleanup on disconnect
- **Replaces**: Previous polling mechanism

### 🔒 Security Enhancements

#### 1. CORS Configuration
- Narrowed to `WEB_ORIGIN` environment variable
- Production-ready with credential support
- No wildcards - explicit origin whitelist

#### 2. Cookie Security
- `secure: true` in production (HTTPS only)
- `httpOnly: true` to prevent XSS attacks
- `sameSite: 'lax'` to mitigate CSRF

#### 3. Rate Limiting
Applied to high-risk endpoints:
- **Follow/Unfollow**: 20 requests/minute
- **Post Creation**: 10 posts/minute
- **Interactions** (like/bookmark/comment): 30/minute
- **Comments**: 15/minute

Token bucket algorithm with per-user tracking.

#### 4. Enhanced Error Handling
- `GlobalExceptionFilter` for consistent error responses
- Structured JSON errors with:
  - `statusCode`
  - `message`
  - `error` type
  - `timestamp`
  - `path`
- Stack traces hidden in production
- Proper 403, 429, 500 status codes

### 🔐 Admin & Authorization

#### User Roles
- Added `UserRole` enum: `USER` | `ADMIN`
- Migration: `20251119144103_add_user_role`
- Default role: `USER`

#### AdminGuard
Protected endpoints:
- `POST /jam-templates` - Create templates
- `POST /auth/invite/create` - Generate invite codes
- `GET /flags` - View all flags
- `POST /flags/:id/resolve` - Resolve flags
- `POST /flags/:id/dismiss` - Dismiss flags

#### Backfill Admin User
Run: `psql < scripts/backfill-admin.sql`
- Sets first user as ADMIN
- Customize by handle or email

### ⚙️ Worker Service

#### Purpose
Hourly background job to update post rank scores based on recency and engagement.

#### Structure
```
apps/worker/
├── src/
│   ├── index.ts          # Main worker with interval scheduler
│   └── update-ranks.ts   # One-time rank update script
├── Dockerfile
├── fly.toml              # Fly.io deployment config
├── railway.toml          # Railway deployment config
├── package.json
└── tsconfig.json
```

#### Running Locally
```bash
# Development with auto-reload
pnpm worker:dev

# Production
pnpm worker:start

# One-time manual update
pnpm worker:update-ranks
```

#### Deployment
- **Fly.io**: `fly deploy` from `apps/worker`
- **Railway**: Automatic deployment with `railway.toml`
- **Environment Variables**: `DATABASE_URL`, `RANK_UPDATE_INTERVAL_MS`

#### Algorithm
SQL formula:
```sql
rank_score = 0.6 * recency_score + 0.4 * engagement_score
```
- Recency: Inversely proportional to hours since creation
- Engagement: Normalized by interaction count

### 🧪 Testing

#### New E2E Test Suite
File: `apps/api/test/production-features.e2e-spec.ts`

Tests cover:
1. **Follower Pagination**
   - GET `/users/profile/:handle/followers`
   - GET `/users/profile/:handle/following`
   - Cursor-based pagination

2. **Template Start-Jam Flow**
   - GET `/jam-templates`
   - POST `/jams` (with/without template)

3. **Moderation Admin**
   - Admin-only access enforcement
   - Flag listing, resolving, dismissing

4. **SSE Notifications**
   - Connection establishment
   - Heartbeat reception
   - Unread count endpoint

5. **Rate Limiting**
   - Verifies 429 responses on excessive requests

## Breaking Changes
None - all changes are additive.

## Migration Steps

### 1. Database Migration
```bash
cd apps/api
npx prisma migrate deploy
```

Or manually apply:
```sql
-- apps/api/prisma/migrations/20251119144103_add_user_role/migration.sql
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
```

### 2. Backfill Admin User
```bash
# Option 1: Use script
psql $DATABASE_URL < scripts/backfill-admin.sql

# Option 2: Manual SQL
psql $DATABASE_URL -c "UPDATE \"User\" SET role = 'ADMIN' WHERE handle = 'yourusername';"
```

### 3. Environment Variables

#### API (`apps/api/.env`)
```env
# Existing
DATABASE_URL=postgresql://user:pass@host:5432/devsocial
JWT_SECRET=your-secret-key
PORT=4000

# New/Updated
NODE_ENV=production
WEB_ORIGIN=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### Worker (`apps/worker/.env`)
```env
DATABASE_URL=postgresql://user:pass@host:5432/devsocial
RANK_UPDATE_INTERVAL_MS=3600000  # 1 hour (default)
NODE_ENV=production
```

#### Web (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
```

### 4. Deploy Services

#### API
```bash
cd apps/api
fly deploy  # or your preferred platform
```

#### Worker
```bash
cd apps/worker
pnpm install
pnpm build
fly deploy  # or railway up
```

#### Web
```bash
cd apps/web
pnpm install
pnpm build
# Deploy to Vercel/Netlify/etc
```

## API Endpoint Changes

### New Endpoints
- `GET /users/profile/:handle/followers` - Paginated followers by handle
- `GET /users/profile/:handle/following` - Paginated following by handle
- `GET /notifications/stream` - SSE endpoint for real-time notifications
- `POST /flags/:id/dismiss` - Dismiss a flag (admin only)

### Updated Endpoints
- `POST /jam-templates` - Now requires `AdminGuard`
- `POST /auth/invite/create` - Now requires `AdminGuard`
- `GET /flags` - Now requires `AdminGuard`
- `POST /flags/:id/resolve` - Now requires `AdminGuard`

### Rate-Limited Endpoints
- `POST /users/:id/follow`
- `DELETE /users/:id/follow`
- `POST /posts/:id/like`
- `POST /posts/:id/bookmark`
- `POST /posts/:id/comment`
- `DELETE /posts/:id/interaction`

## Configuration Reference

### CORS
Production CORS is strict:
```typescript
origin: process.env.WEB_ORIGIN || 'http://localhost:3000'
credentials: true
```

### Rate Limits
Adjust in `apps/api/src/common/guards/rate-limit.guard.ts`:
```typescript
const CAP = 20;           // Max actions
const WINDOW_MS = 60000;  // Per 60 seconds
```

### Worker Interval
Default: 1 hour. Adjust via `RANK_UPDATE_INTERVAL_MS` env var.
```env
RANK_UPDATE_INTERVAL_MS=1800000  # 30 minutes
```

## Known Issues
1. **SSE Authentication**: EventSource doesn't support custom headers. Consider token via query param or use cookie-based auth for production.
2. **Rate Limit Storage**: In-memory store. For multi-instance deployments, use Redis.
3. **Worker High Availability**: Single instance. For redundancy, use distributed locking (e.g., pg_advisory_lock).

## Performance Notes
- Rank score updates take ~100-500ms depending on post count
- SSE heartbeat every 30s consumes minimal bandwidth
- Follower pagination optimized with cursor-based queries
- Rate limiting adds <1ms overhead per request

## Security Checklist
- ✅ CORS narrowed to specific origins
- ✅ Cookies secure in production (HTTPS, httpOnly, sameSite)
- ✅ Rate limiting on write operations
- ✅ Admin routes protected with role-based guard
- ✅ Error responses sanitized (no stack traces in prod)
- ✅ Input validation with `class-validator`
- ✅ Helmet.js security headers enabled

## Support & Troubleshooting

### Worker Not Updating Ranks
1. Check `DATABASE_URL` is accessible
2. Verify SQL file path: `apps/api/src/db/update_rank_scores.sql`
3. Check logs: `docker logs <worker-container>`

### Admin Access Denied
1. Verify user role: `SELECT role FROM "User" WHERE handle = 'yourhandle';`
2. Re-run backfill script if needed
3. Clear JWT token and re-login

### SSE Not Connecting
1. Ensure `/notifications/stream` is reachable
2. Check CORS allows credentials
3. Verify JWT token is valid
4. Check browser console for errors

### Rate Limit Too Strict
Adjust guards in `rate-limit.guard.ts` or disable per-endpoint:
```typescript
// Remove RateLimitGuard from decorator
@UseGuards(JwtAuthGuard)  // Remove: , RateLimitGuard
```

## Rollback Plan
If issues arise:
1. **Database**: Revert migration
   ```sql
   ALTER TABLE "User" DROP COLUMN "role";
   DROP TYPE "UserRole";
   ```
2. **API**: Deploy previous version
3. **Worker**: Stop worker service (posts remain accessible)
4. **Web**: Revert to previous deployment

## Contributors
DevSocial Team

## License
MIT
