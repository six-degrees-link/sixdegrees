-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE persona_type AS ENUM (
  'general_user',
  'job_seeker',
  'employer',
  'recruiter',
  'content_moderator',
  'content_creator',
  'company',
  'service_provider',
  'coach',
  'educator',
  'platform_admin'
);

CREATE TYPE requirement_status AS ENUM (
  'draft',
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'merged'
);

CREATE TYPE vote_type AS ENUM ('up', 'down');

-- ============================================================
-- contributors
-- PK matches auth.users.id so auth.uid() works directly
-- ============================================================

CREATE TABLE contributors (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text        UNIQUE NOT NULL,
  display_name text,
  avatar_url   text,
  verified     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- requirements
-- ============================================================

CREATE TABLE requirements (
  id                   uuid                NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id       uuid                NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  raw_input            text                NOT NULL,
  refined_title        text,
  user_story           text,
  refined_description  text,
  persona_type         persona_type,
  acceptance_criteria  jsonb               NOT NULL DEFAULT '[]'::jsonb,
  priority_suggestion  text,
  category             text,
  tags                 text[]              NOT NULL DEFAULT '{}',
  status               requirement_status  NOT NULL DEFAULT 'draft',
  upvotes              integer             NOT NULL DEFAULT 0,
  downvotes            integer             NOT NULL DEFAULT 0,
  comment_count        integer             NOT NULL DEFAULT 0,
  -- Generated tsvector column for full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(refined_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(user_story, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(refined_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(raw_input, '')), 'D')
  ) STORED,
  created_at           timestamptz         NOT NULL DEFAULT now(),
  updated_at           timestamptz         NOT NULL DEFAULT now()
);

-- ============================================================
-- requirement_votes
-- ============================================================

CREATE TABLE requirement_votes (
  id               uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id   uuid        NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  contributor_id   uuid        NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  vote_type        vote_type   NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requirement_id, contributor_id)
);

-- ============================================================
-- requirement_comments
-- ============================================================

CREATE TABLE requirement_comments (
  id               uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id   uuid        NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  contributor_id   uuid        NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  body             text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ai_usage_log
-- ============================================================

CREATE TABLE ai_usage_log (
  id               uuid           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id   uuid           REFERENCES contributors(id) ON DELETE SET NULL,
  requirement_id   uuid           REFERENCES requirements(id) ON DELETE SET NULL,
  model            text           NOT NULL,
  tokens_input     integer        NOT NULL DEFAULT 0,
  tokens_output    integer        NOT NULL DEFAULT 0,
  cost_usd         numeric(10, 6) NOT NULL DEFAULT 0,
  created_at       timestamptz    NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

-- requirements: common query patterns
CREATE INDEX idx_requirements_contributor ON requirements (contributor_id);
CREATE INDEX idx_requirements_status      ON requirements (status);
CREATE INDEX idx_requirements_persona     ON requirements (persona_type);
CREATE INDEX idx_requirements_category    ON requirements (category);
CREATE INDEX idx_requirements_created     ON requirements (created_at DESC);

-- requirements: full-text search
CREATE INDEX idx_requirements_search ON requirements USING gin (search_vector);

-- requirements: pg_trgm similarity for duplicate detection
CREATE INDEX idx_requirements_title_trgm ON requirements USING gin (refined_title gin_trgm_ops)
  WHERE refined_title IS NOT NULL;

-- votes / comments: FK lookups
CREATE INDEX idx_votes_requirement    ON requirement_votes (requirement_id);
CREATE INDEX idx_votes_contributor    ON requirement_votes (contributor_id);
CREATE INDEX idx_comments_requirement ON requirement_comments (requirement_id);
CREATE INDEX idx_comments_contributor ON requirement_comments (contributor_id);

-- ai_usage_log
CREATE INDEX idx_ai_log_contributor ON ai_usage_log (contributor_id);
CREATE INDEX idx_ai_log_created     ON ai_usage_log (created_at DESC);
