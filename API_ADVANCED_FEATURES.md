# DevSocial API - Advanced Features

This document describes the newly added advanced features (Phase 2).

## New Endpoints

### Invite Codes

**Create Invite Codes** (Admin)
```
POST /auth/invite/create
Authorization: Bearer <token>

Body:
{
  "count": 5,  // optional, default 1
  "expiresAt": "2025-12-31T23:59:59Z"  // optional
}

Response:
{
  "codes": ["ABC123DEF", "XYZ789GHI", ...],
  "count": 5
}
```

**Claim Invite Code**
```
POST /auth/invite/claim

Body:
{
  "code": "ABC123DEF"
}

Response:
{
  "success": true,
  "message": "Invite code valid. Please sign in to continue."
}
```

**Get Invite Codes** (Admin)
```
GET /auth/invite
Authorization: Bearer <token>

Response:
{
  "invites": [
    {
      "code": "ABC123DEF",
      "created_by": "user123",
      "used_by": null,
      "used_at": null,
      "expires_at": "2025-12-31T23:59:59Z",
      "is_active": true
    }
  ]
}
```

---

### Feedback

**Submit Feedback** (Authenticated)
```
POST /feedback
Authorization: Bearer <token>

Body:
{
  "text": "Great platform!"
}

Response:
{
  "success": true,
  "feedback": {
    "id": "fb_123",
    "user_id": "user123",
    "text": "Great platform!",
    "type": "feedback",
    "created_at": "2025-11-19T..."
  }
}
```

**Get All Feedback** (Admin)
```
GET /feedback?cursor=&limit=20
Authorization: Bearer <token>

Response:
{
  "items": [...],
  "nextCursor": "..."
}
```

**Waitlist Submission** (Public)
```
POST /feedback/waitlist

Body:
{
  "text": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Added to waitlist!"
}
```

---

### Jam Templates

**Get Templates**
```
GET /jam-templates

Response:
{
  "templates": [
    {
      "id": "tmpl_js",
      "title": "JavaScript",
      "description": "Basic JavaScript starter",
      "language": "javascript",
      "starter_code": "console.log('Hello World');",
      "created_at": "..."
    }
  ]
}
```

**Create Template** (Admin)
```
POST /jam-templates
Authorization: Bearer <token>

Body:
{
  "title": "React Component",
  "description": "React starter",
  "language": "javascript",
  "starterCode": "import React from 'react'..."
}
```

**Create Jam with Template**
```
POST /jams
Authorization: Bearer <token>

Body:
{
  "templateId": "tmpl_js"  // optional
}

Response:
{
  "id": "jam123",
  "roomId": "abc...",
  "hostId": "user123"
}
```

---

### Moderation

**Flag a Post**
```
POST /posts/:postId/flags
Authorization: Bearer <token>

Body:
{
  "reason": "Inappropriate content"
}

Response:
{
  "success": true,
  "flag": {
    "id": "flag_123",
    "user_id": "user123",
    "post_id": "post456",
    "reason": "Inappropriate content",
    "status": "OPEN",
    "created_at": "..."
  }
}
```

**Get All Flags** (Admin)
```
GET /flags?status=OPEN&cursor=&limit=20
Authorization: Bearer <token>

Response:
{
  "items": [
    {
      "id": "flag_123",
      "user_id": "user123",
      "post_id": "post456",
      "reason": "...",
      "status": "OPEN",
      "reporter_name": "John Doe",
      "post_content": "...",
      "created_at": "..."
    }
  ],
  "nextCursor": "..."
}
```

**Resolve Flag** (Admin)
```
POST /flags/:id/resolve
Authorization: Bearer <token>

Body:
{
  "status": "RESOLVED"  // or "DISMISSED"
}

Response:
{
  "success": true
}
```

---

### Profile Follow Tabs

**Get Followers by Handle**
```
GET /users/profile/:handle/followers?cursor=&limit=20

Response:
{
  "items": [
    {
      "id": "user123",
      "name": "John Doe",
      "handle": "johndoe",
      "avatar": "...",
      "created_at": "..."
    }
  ],
  "nextCursor": "..."
}
```

**Get Following by Handle**
```
GET /users/profile/:handle/following?cursor=&limit=20

Response:
{
  "items": [...],
  "nextCursor": "..."
}
```

---

### Notifications SSE

**Stream Notifications** (Server-Sent Events)
```
GET /notifications/stream
Authorization: Bearer <token>

Content-Type: text/event-stream

Event Stream:
data: {"type":"heartbeat","unreadCount":3}

data: {"type":"notification","notification":{...}}
```

Client-side usage:
```javascript
const eventSource = new EventSource('/notifications/stream', {
  headers: { Authorization: `Bearer ${token}` }
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification') {
    // Handle new notification
  }
};
```

---

## Feed Ranking

### Materialized Rank Score

Posts now have a `rank_score` column that is updated hourly via cron:

```sql
-- Run hourly: apps/api/src/db/update_rank_scores.sql
UPDATE "Post" SET rank_score = (
  0.6 * (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0)) +
  0.4 * (engagement_count / max_engagement)
);
```

Formula:
- **60% Recency**: Newer posts score higher
- **40% Engagement**: Posts with more interactions score higher

Setup cron job:
```bash
crontab -e
# Add: 0 * * * * psql -U dev -d devsocial -f /path/to/update_rank_scores.sql
```

---

## Database Schema Updates

New tables added in migration `20251119_advanced_features.sql`:

- **InviteCode**: code (PK), created_by, used_by, used_at, expires_at, is_active
- **Feedback**: id (PK), user_id, text, type, created_at
- **JamTemplate**: id (PK), title, description, language, starter_code, created_at
- **Flag**: id (PK), user_id, post_id, reason, status (enum), resolved_by, resolved_at, created_at

Column additions:
- **Post**: rank_score (float, indexed)

---

## Testing

Run E2E tests:
```bash
cd apps/api
pnpm test:e2e
```

New test file: `test/advanced-features.e2e-spec.ts`
- Invite code creation and validation (3 tests)
- Jam templates (2 tests)
- Moderation flags (3 tests, partially skipped)
- Feedback submission (2 tests)
- Profile followers/following (2 tests)

---

## Frontend Integration

### Pages Added:
- `/feedback` - Feedback submission form
- `/landing` - Updated with invite code input and waitlist

### Components to Add:
- Profile tabs component (Posts | Followers | Following)
- SSE notification handler (replace polling)
- Jam template selector modal
- Report button on posts

---

## Security Notes

- Admin-only endpoints need proper role checking (marked as TODO)
- Invite codes expire based on `expires_at` field
- SSE connections are in-memory (will reset on server restart)
- Flag moderation requires authentication

---

## Performance Considerations

- Rank score updates run hourly (adjust frequency as needed)
- SSE heartbeat every 15 seconds (configurable)
- All new endpoints use cursor-based pagination (max 50 items)
- Indexes added on frequently queried columns

---

For more details, see `FEATURES_COMPLETE.md` and individual module documentation.
