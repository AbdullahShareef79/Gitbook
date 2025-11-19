-- Migration: Advanced Features (Invite Codes, Feedback, Jam Templates, Moderation, Feed Ranking)
-- Date: 2025-11-19
-- Description: Adds tables for invite codes, feedback, jam templates, moderation flags, and feed ranking score

-- 1. Invite Codes Table
CREATE TABLE IF NOT EXISTS "InviteCode" (
  code TEXT PRIMARY KEY,
  created_by TEXT,
  used_by TEXT REFERENCES "User"(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX invite_code_active_idx ON "InviteCode"(is_active) WHERE is_active = true;
CREATE INDEX invite_code_used_by_idx ON "InviteCode"(used_by);

-- 2. Feedback Table
CREATE TABLE IF NOT EXISTS "Feedback" (
  id TEXT PRIMARY KEY DEFAULT 'fb_' || substr(md5(random()::text), 1, 16),
  user_id TEXT REFERENCES "User"(id),
  text TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX feedback_user_idx ON "Feedback"(user_id);
CREATE INDEX feedback_created_idx ON "Feedback"(created_at DESC);

-- 3. Jam Templates Table
CREATE TABLE IF NOT EXISTS "JamTemplate" (
  id TEXT PRIMARY KEY DEFAULT 'tmpl_' || substr(md5(random()::text), 1, 16),
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'javascript',
  starter_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX jam_template_language_idx ON "JamTemplate"(language);

-- 4. Moderation Flags Table
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

CREATE TABLE IF NOT EXISTS "Flag" (
  id TEXT PRIMARY KEY DEFAULT 'flag_' || substr(md5(random()::text), 1, 16),
  user_id TEXT NOT NULL REFERENCES "User"(id),
  post_id TEXT REFERENCES "Post"(id),
  comment_id TEXT,
  reason TEXT NOT NULL,
  status "FlagStatus" NOT NULL DEFAULT 'OPEN',
  resolved_by TEXT REFERENCES "User"(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX flag_status_idx ON "Flag"(status) WHERE status = 'OPEN';
CREATE INDEX flag_post_idx ON "Flag"(post_id);
CREATE INDEX flag_created_idx ON "Flag"(created_at DESC);

-- 5. Feed Ranking Score (add column to Post table)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS rank_score FLOAT DEFAULT 0;

CREATE INDEX post_rank_score_idx ON "Post"(rank_score DESC, created_at DESC);

-- Insert some default jam templates
INSERT INTO "JamTemplate" (id, title, description, language, starter_code) VALUES
  ('tmpl_javascript_hello', 'JavaScript Hello World', 'A simple JavaScript starter', 'javascript', 'console.log("Hello, World!");\n\n// Start coding here...'),
  ('tmpl_typescript_api', 'TypeScript API', 'Express API starter with TypeScript', 'typescript', 'import express from ''express'';\n\nconst app = express();\nconst port = 3000;\n\napp.get(''/'', (req, res) => {\n  res.json({ message: ''Hello World'' });\n});\n\napp.listen(port, () => {\n  console.log(`Server running on port ${port}`);\n});'),
  ('tmpl_python_data', 'Python Data Analysis', 'Python starter for data analysis', 'python', 'import pandas as pd\nimport numpy as np\n\n# Your data analysis code here\ndf = pd.DataFrame({\n    ''col1'': [1, 2, 3],\n    ''col2'': [4, 5, 6]\n})\n\nprint(df.head())'),
  ('tmpl_react_component', 'React Component', 'React functional component starter', 'javascript', 'import React, { useState } from ''react'';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h1>Counter: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n\nexport default App;')
ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE "InviteCode" IS 'Stores invite codes for platform access control';
COMMENT ON TABLE "Feedback" IS 'User feedback and waitlist submissions';
COMMENT ON TABLE "JamTemplate" IS 'Code templates for starting new jam sessions';
COMMENT ON TABLE "Flag" IS 'Content moderation flags reported by users';
COMMENT ON COLUMN "Post"."rank_score" IS 'Materialized ranking score: 0.6*recency + 0.4*engagement';
