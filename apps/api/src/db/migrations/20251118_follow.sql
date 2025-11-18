-- Follow system
CREATE TABLE IF NOT EXISTS "Follow" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "followerId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "followeeId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("followerId", "followeeId")
);

CREATE INDEX IF NOT EXISTS follow_followers_idx ON "Follow"("followeeId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS follow_following_idx ON "Follow"("followerId", "createdAt" DESC);
