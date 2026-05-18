-- ─────────────────────────────────────────────
--  WWTBAM — Initial Schema
-- ─────────────────────────────────────────────

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text        text NOT NULL,
  options     text[] NOT NULL,          -- always 4 elements
  correct_idx smallint NOT NULL,        -- 0-3
  category    text NOT NULL,            -- 'random' | profession slug
  difficulty  smallint NOT NULL,        -- 1–15 (maps to prize ladder)
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX questions_category_difficulty_idx
  ON questions (category, difficulty);

-- Game Sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users ON DELETE CASCADE,
  mode                 text NOT NULL,          -- 'random' | profession slug
  questions_answered   smallint DEFAULT 0,
  prize_reached        bigint DEFAULT 0,
  lifelines_used       text[] DEFAULT '{}',
  completed            boolean DEFAULT false,
  walked_away          boolean DEFAULT false,
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX game_sessions_user_id_idx ON game_sessions (user_id);
CREATE INDEX game_sessions_prize_reached_idx ON game_sessions (prize_reached DESC);

-- ─────────────────────────────────────────────
--  Row Level Security
-- ─────────────────────────────────────────────

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Questions: public read
CREATE POLICY "questions_public_read"
  ON questions FOR SELECT
  USING (true);

-- Sessions: owner only
CREATE POLICY "sessions_owner_select"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_owner_insert"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_owner_update"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
--  Leaderboard view (top 50 per mode)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  gs.id,
  gs.user_id,
  au.email AS user_email,
  gs.mode,
  gs.prize_reached,
  gs.questions_answered,
  gs.walked_away,
  gs.created_at
FROM game_sessions gs
JOIN auth.users au ON au.id = gs.user_id
WHERE gs.completed = true OR gs.walked_away = true
ORDER BY gs.prize_reached DESC;
