-- Analytics event log
CREATE TABLE IF NOT EXISTS "Event"(
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text,
  kind text NOT NULL,
  payload jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_kind_created_idx ON "Event"(kind, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS event_user_created_idx ON "Event"("userId", "createdAt" DESC);
