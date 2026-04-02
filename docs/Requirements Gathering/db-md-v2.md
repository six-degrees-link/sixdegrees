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
```

> **Note**: `feature_category` and `contributor_role` enums were planned but not implemented.
> `category` is stored as `text` on the requirements table for flexibility.
> Contributor roles are managed via the `ADMIN_EMAILS` environment variable.

## Tables

### contributors

Maps to Supabase Auth users. Created on first login.

```sql
CREATE TABLE contributors (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text        UNIQUE NOT NULL,
  display_name text,
  avatar_url   text,
  verified     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

Auto-created on signup via trigger in `20260401000002_functions_triggers.sql`.
`verified` flag is for future identity verification feature.

### requirements

The core table. Stores both the raw input and AI-refined output.

```sql
CREATE TABLE requirements (
  id                   uuid               NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id       uuid               NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  raw_input            text               NOT NULL,

  -- AI-refined fields (null until /api/refine is called)
  refined_title        text,
  user_story           text,              -- "As a [persona], I want..."
  refined_description  text,
  acceptance_criteria  jsonb              NOT NULL DEFAULT '[]'::jsonb,
  priority_suggestion  text,
  tags                 text[]             NOT NULL DEFAULT '{}',

  -- Classification
  persona_type         persona_type,      -- nullable: set on submit, may be corrected by AI
  category             text,              -- free text, not an enum
  status               requirement_status NOT NULL DEFAULT 'draft',

  -- Engagement (denormalized, kept in sync by triggers)
  upvotes              integer            NOT NULL DEFAULT 0,
  downvotes            integer            NOT NULL DEFAULT 0,
  comment_count        integer            NOT NULL DEFAULT 0,

  -- Full-text search (generated, weights: title A, user_story B, description C, raw D)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(refined_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(user_story, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(refined_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(raw_input, '')), 'D')
  ) STORED,

  -- Moderation + deduplication (added M5)
  merged_into          uuid,              -- FK → requirements(id), set when status = 'merged'
  is_flagged           boolean            NOT NULL DEFAULT false,
  flag_reason          text,

  created_at           timestamptz        NOT NULL DEFAULT now(),
  updated_at           timestamptz        NOT NULL DEFAULT now()
);
```

Indexes: `status`, `persona_type`, `category`, `contributor_id`, `created_at DESC`, GIN on `search_vector`, GIN trigram on `refined_title`, partial on `merged_into` (non-null), partial on `is_flagged` (true).

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
  id             uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id uuid        NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  contributor_id uuid        NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  body           text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),  -- set on edit; trigger fires BEFORE UPDATE
  is_flagged     boolean     NOT NULL DEFAULT false,
  flag_reason    text
);
```

### ai_usage_log

Track Claude API costs.

```sql
CREATE TABLE ai_usage_log (
  id             uuid           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id uuid           REFERENCES contributors(id) ON DELETE SET NULL,
  requirement_id uuid           REFERENCES requirements(id) ON DELETE SET NULL,
  model          text           NOT NULL,
  tokens_input   integer        NOT NULL DEFAULT 0,
  tokens_output  integer        NOT NULL DEFAULT 0,
  cost_usd       numeric(10, 6) NOT NULL DEFAULT 0,
  created_at     timestamptz    NOT NULL DEFAULT now()
);
```

> **Column names**: `tokens_input` / `tokens_output` (not `input_tokens` / `output_tokens`).
> `requirement_id` FK added for per-requirement cost tracking.
> `contributor_id` is nullable (SET NULL on contributor delete).

### persona_subscriptions

User subscriptions to persona types (for future email digests).

```sql
CREATE TABLE persona_subscriptions (
  id             uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contributor_id uuid         NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  persona_type   persona_type NOT NULL,
  created_at     timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (contributor_id, persona_type)
);
```

RLS: users can only SELECT/INSERT/DELETE their own rows.

## Database Functions

Vote and comment counts use **increment/decrement triggers** (not full recounts) for performance.

### Vote count triggers

Insert: increments `upvotes` or `downvotes` by 1.
Delete: decrements with `GREATEST(n - 1, 0)` floor to prevent negatives.
See `20260401000002_functions_triggers.sql` for full implementation.

### Comment count triggers

Insert: increments `comment_count` by 1.
Delete: decrements with `GREATEST(n - 1, 0)` floor.

### `updated_at` trigger

`handle_updated_at()` fires `BEFORE UPDATE` on `requirements` and `requirement_comments` to keep `updated_at` current.

### `handle_new_user()` trigger

Fires `AFTER INSERT ON auth.users` — auto-creates a `contributors` row on signup.

### find_similar_requirements

Pre-AI duplicate detection using `pg_trgm` similarity:

```sql
-- Signature (actual implementation)
find_similar_requirements(
  search_title        text,
  similarity_threshold float DEFAULT 0.3,
  result_limit         integer DEFAULT 20
)
RETURNS TABLE (id uuid, refined_title text, status requirement_status, similarity float)
```

Called before the Claude API to surface potential duplicates.
Returns requirements with similarity > threshold, excluding `rejected` ones.

> **Note**: There is no `search_persona` parameter (cross-persona duplicate detection is intentional).
> There is no `get_daily_ai_cost()` DB function — daily cost is queried directly from `ai_usage_log` in the API route.

## Row Level Security Policies

All tables have RLS enabled. See `20260401000001_rls_policies.sql` for full SQL.

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `contributors` | Public | Via trigger only | Own row | — |
| `requirements` | Public (approved/submitted/in_review) + own drafts | Own (`contributor_id = auth.uid()`) | Own drafts only | — |
| `requirement_votes` | Public | Own (`contributor_id = auth.uid()`) | — | Own |
| `requirement_comments` | On public requirements | Own, on public requirements | — | Own |
| `ai_usage_log` | Own | Service role only (bypasses RLS) | — | — |

Key policy decisions:
- Requirements in `draft` status are only visible to their author
- Contributors can only edit their own requirements while still in `draft` status — status changes to `submitted`+ are admin-only (via service role)
- AI usage inserts happen via `createServiceClient()` in API routes (service role bypasses RLS)
- Admin moderation uses the service role key, not a DB-level `admin` role

## TypeScript Types

Types live at `lib/supabase/types.ts` (not `types/database.ts`).
Regenerate after any schema change:

```bash
supabase gen types typescript --project-id fownudwjeugbnfuxvzch > lib/supabase/types.ts
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
  | 'accessibility'
  | 'admin'
  | 'analytics'
  | 'billing'
  | 'content'
  | 'jobs'
  | 'messaging'
  | 'microsites'
  | 'moderation'
  | 'networking'
  | 'notifications'
  | 'profile'
  | 'search'
  | 'verification'
  | 'other'; // alphabetical, 'other' always last

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
  persona_type: PersonaType | null;
  category: string | null;       // text column, not a DB enum
  status: RequirementStatus;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_flagged: boolean;
  flag_reason: string | null;
  merged_into: string | null;    // UUID of the requirement this was merged into
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

// Actual columns — no role, bio, or updated_at on contributors
export interface Contributor {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  verified: boolean;             // reserved for future identity verification
  created_at: string;
  // Admin status is NOT stored in DB — determined by ADMIN_EMAILS env var via isAdmin()
}
```
