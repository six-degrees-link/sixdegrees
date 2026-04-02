# Contributing to SixDegrees

This is a volunteer project. If you're here to help build it, welcome. This doc covers everything you need to set up locally, write code that fits the project, and get your changes merged.

---

## Table of Contents

- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Code standards](#code-standards)
- [Design system](#design-system)
- [Database & migrations](#database--migrations)
- [AI integration](#ai-integration)
- [Branching & commits](#branching--commits)
- [Pull requests](#pull-requests)
- [Environment variables](#environment-variables)

---

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)
- An Anthropic API key (for AI refinement)
- A Resend account (for magic link emails)

### Setup

```bash
git clone https://github.com/six-degrees-link/sixdegrees.git
cd sixdegrees
npm install
cp .env.example .env.local
```

Fill in `.env.local` — see [Environment variables](#environment-variables) below.

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Supabase setup

Apply all migrations from `supabase/migrations/` in order against your Supabase project. The SQL files are numbered — run them sequentially.

After applying migrations, enable Row Level Security on all tables. RLS policies are included in the migration files.

---

## Project structure

```
app/                    Next.js App Router pages and API routes
  api/                  All API endpoints
  (auth)/               Auth flow pages (signin, callback, confirm, error)
  admin/                Admin moderation queue
  browse/               Browseable requirements list
  dashboard/            Persona + category coverage charts
  leaderboard/          Top contributors
  requirements/[id]/    Requirement detail, voting, comments
  submit/               3-step submission form
components/             Shared React components
  admin/                Admin-only UI (moderation, merge dialog)
  auth/                 Auth UI (sign-in form)
  browse/               Browse page UI (cards, filters, pagination)
  requirements/         Requirement detail UI (comments, votes, flags)
  submit/               Submission form
lib/                    Shared logic and utilities
  auth/                 Auth context and admin helpers
  claude/               Anthropic client, prompts, response parsing
  constants/            Persona definitions
  email/                Resend client and email templates
  supabase/             Supabase clients (browser + server + types)
  validators/           Zod schemas for API input validation
docs/                   Project documentation
supabase/               Database migrations
```

---

## Code standards

### TypeScript

Strict mode is on. No `any`. If you're working around the type system, stop and fix the underlying problem.

### Components

- Functional components and hooks only — no class components.
- Named exports for components. Default exports for Next.js pages.
- `async/await` only — no `.then()` chains.

### API routes

Every API route that accepts user input must validate it with Zod. No exceptions.

API responses always follow this shape:

```ts
{ data?: T, error?: string, code?: string }
```

Don't invent new response formats.

### Auth patterns

- Use `useAuth()` from `lib/auth/context.tsx` in client components for the current user.
- For server-side auth checks in API routes, use the anon Supabase client.
- For database writes that need to bypass RLS (admin routes only), use `createServiceClient()` from `lib/supabase/server.ts`. This client is **synchronous** — do not `await` the call itself.

```ts
// correct
const db = createServiceClient();

// wrong
const db = await createServiceClient();
```

### Error handling

- User-facing errors: throw a toast notification.
- API errors: `console.error` the full error server-side, return a structured `{ error, code }` response to the client.
- Don't swallow errors silently.

### What not to do

- Don't add comments to code that's self-explanatory.
- Don't add error handling for things that can't happen.
- Don't add features that weren't asked for.
- Don't use Tailwind utility classes — this project uses plain CSS custom properties.

---

## Design system

The design is Linear-inspired: dark backgrounds, no box-shadows, depth through background color stepping, compact UI at 13px, surgical accent color.

### Core tokens

```css
/* Backgrounds */
--bg-page: #08090a
--bg-card: #0f1011
--bg-elevated: #161718
--bg-input: #1a1b1e
--bg-hover: #1c1e21

/* Text */
--text-primary: #f7f8f8
--text-secondary: #d0d6e0
--text-tertiary: #8a8f98
--text-muted: #6b6f76

/* Borders */
--border-default: #1c1e21
--border-input: #2a2d32

/* Accent */
--accent-primary: #828fff
```

### Rules

- **No box-shadows, ever.** Depth comes from background color stepping.
- **No gradients.** Flat surfaces only.
- Body text is `--text-secondary`, not `--text-primary`. Primary is for headings.
- All headings 24px and above must have negative letter-spacing.
- Controls (inputs, buttons) are 30px tall.
- Transitions are 150ms. Don't slow them down.
- Icons: Lucide, 16–20px, 1.5px stroke, default color `--text-tertiary`.

### Buttons

```
Primary:   background #e6e6e6, dark text
Secondary: background #2d2e31
Ghost:     transparent background
```

### Typography scale

| Use | Size | Weight | Letter-spacing |
|-----|------|--------|---------------|
| Hero | 64px | 510 | -1.408px |
| Page title | 48px | 510 | -1.056px |
| Card heading | 24px | 590 | -0.288px |
| UI labels / buttons | 13px | 510 | — |
| Body | 17px | 400 | — |

Font is Inter Variable, loaded from Google Fonts.

---

## Database & migrations

The database has 6 tables:

| Table | Purpose |
|-------|---------|
| `contributors` | User profiles, created automatically on first sign-in |
| `requirements` | Feature requests with AI-refined content |
| `requirement_votes` | Vote records (upvote or downvote per user per requirement) |
| `requirement_comments` | Comments on requirements |
| `persona_subscriptions` | Users subscribed to persona-based requirement notifications |
| `ai_usage_log` | Per-user AI refinement usage for rate limiting |

**Key details:**

- RLS is enabled on all tables.
- `requirements.vote_count` and `comment_count` are denormalized and kept in sync by database triggers — do not update them manually.
- Full-text search uses a `tsvector` generated column with a GIN index.
- Duplicate detection uses `pg_trgm` similarity + the `find_similar_requirements()` function.

**Requirement status flow:**

```
draft → submitted → in_review → approved
                              → rejected
                              → merged
```

Valid transitions:

| From | To |
|------|----|
| submitted | in_review, approved, rejected, merged |
| in_review | approved, rejected, merged |
| approved | rejected, merged |
| rejected | in_review, approved |
| draft | submitted, in_review, approved, rejected |

When merging, you must also provide a `merged_into` UUID pointing to the target requirement.

**Migrations:** Add new migrations as numbered SQL files in `supabase/migrations/`. Don't edit existing migration files.

---

## AI integration

The AI refinement flow lives in `lib/claude/` and `app/api/refine/route.ts`.

- Model: `claude-sonnet-4-20250514`
- Temperature: 0.3
- Max tokens: 2000
- Rate limit: 10 refinements per user per hour (enforced via `ai_usage_log`)
- Daily cost cap: set by `CLAUDE_DAILY_COST_CAP_USD` (default $10)

When the AI is unavailable or the cost cap is hit, submissions fall back to raw input with status `draft`.

Claude returns structured JSON with these fields:

```
refined_title, user_story, refined_description, acceptance_criteria,
persona_type, category, priority_suggestion, tags,
clarifications_needed, similar_existing_titles
```

Parsing and validation of the Claude response is handled in `lib/claude/parse.ts`. If you change the prompt structure in `lib/claude/prompts.ts`, update the parser and Zod schema to match.

Duplicate detection happens at two levels:
1. `pg_trgm` similarity check before calling Claude (fast, database-side)
2. The top 20 existing requirements are injected into the Claude prompt context so Claude can flag potential duplicates itself

---

## Branching & commits

### Branch names

```
feature/short-description
fix/short-description
chore/short-description
```

Branch off `main`. Keep branches focused — one concern per branch.

### Commit messages

Use the imperative mood. Describe what the commit does, not what you did.

```
Add vote count to leaderboard query
Fix comment pagination off-by-one
Remove unused import in browse page
```

Don't pad commit messages with context that belongs in the PR description.

---

## Pull requests

- Target `main`.
- Keep PRs small and focused. A PR that touches 15 files is probably two PRs.
- Write a clear description: what changed and why. Not a list of files edited.
- If your PR touches the database, include the migration file and note any RLS policy changes.
- If your PR touches the AI prompt, describe the change in behavior and why.

Before submitting:

```bash
npm run lint
npm run build
```

Both must pass cleanly.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=          # From your Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # From your Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=         # From your Supabase project settings (keep secret)
ANTHROPIC_API_KEY=                 # From console.anthropic.com
CLAUDE_DAILY_COST_CAP_USD=10       # Lower this in dev to protect your budget
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=your@email.com        # Comma-separated, grants /admin access
RESEND_API_KEY=                    # From resend.com
EMAIL_FROM=noreply@yourdomain.com  # Must be a verified Resend sender domain
```

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Never expose it to the browser. It is only used server-side in admin API routes.

---

## Questions

Open an issue on GitHub: https://github.com/six-degrees-link/sixdegrees/issues
