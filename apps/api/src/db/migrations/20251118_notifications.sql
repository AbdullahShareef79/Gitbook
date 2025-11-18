-- Notifications system
CREATE TYPE "NotificationType" AS ENUM ('LIKE','BOOKMARK','COMMENT','FOLLOW','JAM_INVITE');

CREATE TABLE IF NOT EXISTS "Notification"(
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type "NotificationType" NOT NULL,
  "refId" text,
  meta jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "readAt" timestamptz
);

CREATE INDEX IF NOT EXISTS notif_user_created_idx ON "Notification"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS notif_unread_idx ON "Notification"("userId", "readAt") WHERE "readAt" IS NULL;
