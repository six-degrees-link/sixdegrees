# SixDegrees - Database Schema (Supabase / PostgreSQL)

## Overview

All data is stored in Supabase (PostgreSQL). Authentication uses Supabase Auth with magic links.
Row Level Security (RLS) is enabled on all tables.

## Enums

```sql
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

CREATE TYPE feature_category AS ENUM (
  'profile',
  'messaging',
  'search',
  'jobs',
  'content',
  'networking',
  'verification',
  'admin',
  'billing',
  'notifications',
  'analytics',
  'microsites',
  'moderation',
  'other'
);

CREATE TYPE contributor_role AS ENUM ('contributor', 'moderator', 'admin');
```

## Tables

### contributors

Maps to Supabase Auth users. Created on first login.

```sql
CREATE TABLE contributors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role contributor_role DEFAULT 'contributor',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to auto-create contributor on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contributors (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contributors_updated_at
  BEFORE UPDATE ON contributors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### requirements

The core table. Stores both the raw input and AI-refined output.

```sql
CREATE TABLE requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,

  -- Raw input from contributor
  raw_input TEXT NOT NULL,

  -- AI-refined fields
  refined_title TEXT,
  user_story TEXT,                    -- "As a [persona], I want..."
  refined_description TEXT,           -- Expanded description
  acceptance_criteria JSONB DEFAULT '[]'::jsonb,  -- Array of strings
  priority_suggestion TEXT,           -- "High", "Medium", "Low" with reasoning
  tags JSONB DEFAULT '[]'::jsonb,     -- Array of tag strings

  -- Classification
  persona_type persona_type NOT NULL,
  category feature_category DEFAULT 'other',
  status requirement_status DEFAULT 'draft',

  -- Engagement metrics (denormalized for query performance)
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Flags
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  merged_into UUID REFERENCES requirements(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_requirements_persona ON requirements(persona_type);
CREATE INDEX idx_requirements_category ON requirements(category);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_upvotes ON requirements(upvotes DESC);
CREATE INDEX idx_requirements_created ON requirements(created_at DESC);
CREATE INDEX idx_requirements_contributor ON requirements(contributor_id);

-- Full-text search index
ALTER TABLE requirements ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(refined_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(raw_input, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(refined_description, '')), 'C')
  ) STORED;

CREATE INDEX idx_requirements_search ON requirements USING GIN(search_vector);

-- Trigram similarity for duplicate detection
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_requirements_title_trgm ON requirements USING GIN(refined_title gin_trgm_ops);

-- Updated_at trigger
CREATE TRIGGER requirements_updated_at
  BEFORE UPDATE ON requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### requirement_votes

One vote per user per requirement. Enforced at DB level.

```sql
CREATE TABLE requirement_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  vote_type vote_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(requirement_id, contributor_id)
);

CREATE INDEX idx_votes_requirement ON requirement_votes(requirement_id);
CREATE INDEX idx_votes_contributor ON requirement_votes(contributor_id);
```

### requirement_comments

```sql
CREATE TABLE requirement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_requirement ON requirement_comments(requirement_id);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON requirement_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### persona_subscriptions

For email notification preferences.

```sql
CREATE TABLE persona_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  persona_type persona_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(contributor_id, persona_type)
);
```

### ai_usage_log

Track Claude API costs.

```sql
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES contributors(id),
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  model TEXT NOT NULL,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_usage_date ON ai_usage_log(created_at);
```

## Database Functions

### Vote count sync

```sql
CREATE OR REPLACE FUNCTION sync_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE requirements SET
      upvotes = (SELECT COUNT(*) FROM requirement_votes WHERE requirement_id = OLD.requirement_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM requirement_votes WHERE requirement_id = OLD.requirement_id AND vote_type = 'down')
    WHERE id = OLD.requirement_id;
    RETURN OLD;
  ELSE
    UPDATE requirements SET
      upvotes = (SELECT COUNT(*) FROM requirement_votes WHERE requirement_id = NEW.requirement_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM requirement_votes WHERE requirement_id = NEW.requirement_id AND vote_type = 'down')
    WHERE id = NEW.requirement_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON requirement_votes
  FOR EACH ROW
  EXECUTE FUNCTION sync_vote_counts();
```

### Comment count sync

```sql
CREATE OR REPLACE FUNCTION sync_comment_count()
RETURNS TRIGGER AS $$
DECLARE
  req_id UUID;
BEGIN
  req_id := COALESCE(NEW.requirement_id, OLD.requirement_id);
  UPDATE requirements SET
    comment_count = (SELECT COUNT(*) FROM requirement_comments WHERE requirement_id = req_id)
  WHERE id = req_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON requirement_comments
  FOR EACH ROW
  EXECUTE FUNCTION sync_comment_count();
```

### Similar requirements search

```sql
CREATE OR REPLACE FUNCTION find_similar_requirements(
  search_title TEXT,
  search_persona persona_type,
  similarity_threshold FLOAT DEFAULT 0.3,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  refined_title TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.refined_title,
    similarity(r.refined_title, search_title) AS similarity
  FROM requirements r
  WHERE r.persona_type = search_persona
    AND r.status IN ('submitted', 'approved', 'in_review')
    AND r.refined_title IS NOT NULL
    AND similarity(r.refined_title, search_title) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
```

### Daily AI cost check

```sql
CREATE OR REPLACE FUNCTION get_daily_ai_cost()
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(cost_usd) FROM ai_usage_log
     WHERE created_at >= CURRENT_DATE),
    0
  );
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Contributors: read all, update own
CREATE POLICY "Contributors are viewable by everyone"
  ON contributors FOR SELECT USING (true);

CREATE POLICY "Contributors can update own profile"
  ON contributors FOR UPDATE USING (auth.uid() = id);

-- Requirements: read all, create/update own
CREATE POLICY "Requirements are viewable by everyone"
  ON requirements FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create requirements"
  ON requirements FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Contributors can update own draft/submitted requirements"
  ON requirements FOR UPDATE USING (
    auth.uid() = contributor_id
    AND status IN ('draft', 'submitted')
  );

-- Admin override for requirements
CREATE POLICY "Admins can update any requirement"
  ON requirements FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contributors
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Votes: read all, manage own
CREATE POLICY "Votes are viewable by everyone"
  ON requirement_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON requirement_votes FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Users can change own votes"
  ON requirement_votes FOR UPDATE USING (auth.uid() = contributor_id);

CREATE POLICY "Users can remove own votes"
  ON requirement_votes FOR DELETE USING (auth.uid() = contributor_id);

-- Comments: read all, create authenticated, update/delete own
CREATE POLICY "Comments are viewable by everyone"
  ON requirement_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment"
  ON requirement_comments FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Users can update own comments"
  ON requirement_comments FOR UPDATE USING (auth.uid() = contributor_id);

CREATE POLICY "Users can delete own comments"
  ON requirement_comments FOR DELETE USING (auth.uid() = contributor_id);

-- Subscriptions: own only
CREATE POLICY "Users manage own subscriptions"
  ON persona_subscriptions FOR ALL USING (auth.uid() = contributor_id);

-- AI usage: insert own, read for admins
CREATE POLICY "Authenticated users can log AI usage"
  ON ai_usage_log FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Admins can view AI usage"
  ON ai_usage_log FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contributors
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## TypeScript Types

Generate types from Supabase using:
```bash
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

Key types for manual reference:

```typescript
export type PersonaType =
  | 'general_user'
  | 'job_seeker'
  | 'employer'
  | 'recruiter'
  | 'content_moderator'
  | 'content_creator'
  | 'company'
  | 'service_provider'
  | 'coach'
  | 'educator'
  | 'platform_admin';

export type RequirementStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'merged';

export type FeatureCategory =
  | 'profile'
  | 'messaging'
  | 'search'
  | 'jobs'
  | 'content'
  | 'networking'
  | 'verification'
  | 'admin'
  | 'billing'
  | 'notifications'
  | 'analytics'
  | 'microsites'
  | 'moderation'
  | 'other';

export type VoteType = 'up' | 'down';

export interface Requirement {
  id: string;
  contributor_id: string;
  raw_input: string;
  refined_title: string | null;
  user_story: string | null;
  refined_description: string | null;
  acceptance_criteria: string[];
  priority_suggestion: string | null;
  tags: string[];
  persona_type: PersonaType;
  category: FeatureCategory;
  status: RequirementStatus;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_flagged: boolean;
  flag_reason: string | null;
  merged_into: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequirementWithContributor extends Requirement {
  contributor: {
    id: string;
    display_name: string | null;
    email: string;
  };
}

export interface Contributor {
  id: string;
  email: string;
  display_name: string | null;
  role: 'contributor' | 'moderator' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}
```
