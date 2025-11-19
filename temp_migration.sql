CREATE TABLE IF NOT EXISTS "InviteCode" (
  code TEXT PRIMARY KEY,
  created_by TEXT,
  used_by TEXT REFERENCES "User"(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invite_code_active_idx ON "InviteCode"(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS "Feedback" (
  id TEXT PRIMARY KEY DEFAULT 'fb_' || substr(md5(random()::text), 1, 16),
  user_id TEXT REFERENCES "User"(id),
  text TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JamTemplate" (
  id TEXT PRIMARY KEY DEFAULT 'tmpl_' || substr(md5(random()::text), 1, 16),
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'javascript',
  starter_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "Flag" (
  id TEXT PRIMARY KEY DEFAULT 'flag_' || substr(md5(random()::text), 1, 16),
  user_id TEXT NOT NULL REFERENCES "User"(id),
  post_id TEXT REFERENCES "Post"(id),
  reason TEXT NOT NULL,
  status "FlagStatus" NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS rank_score FLOAT DEFAULT 0;

CREATE INDEX IF NOT EXISTS post_rank_score_idx ON "Post"(rank_score DESC, created_at DESC);
