# SixDegrees — Build Progress

**Last updated**: 2026-04-02
**Current milestone**: M5 complete
**Live at**: https://sixdegrees.link
**Repo**: https://github.com/six-degrees-link/sixdegrees

---

## Milestone Status

| # | Name | Target | Status |
|---|------|--------|--------|
| M1 | Foundation & Setup | Apr 13 | ✅ Complete |
| M2 | Requirements Website Live | Apr 27 | ✅ Complete |
| M3 | AI-Powered Refinement | May 11 | ✅ Complete |
| M4 | Community Review (Admin Moderation) | May 25 | ✅ Complete |
| M5 | Consolidation & Export | Jun 30 | ✅ Complete |

---

## What's Built

### M1 — Foundation

- Next.js 16 App Router (TypeScript strict)
- Supabase project provisioned — database schema, RLS, triggers all applied
- Vercel deployment configured — production at `sixdegrees.link`
- `proxy.ts` for Supabase session refresh (Next.js 16 equivalent of `middleware.ts`)
- Google Tag Manager wired into root layout
- `@vercel/analytics` and `@vercel/speed-insights` installed
- `.env.local` with all required keys set

### M2 — Requirements Website

**Auth flow**
- Magic link sign-in at `/signin`
- `/auth/callback/route.ts` — exchanges code for session, sets cookies on the redirect response (not on a separate response), then redirects to `/auth/confirm`
- `/auth/confirm/page.tsx` — client component that calls `router.refresh()` then `router.replace(next)` to bust the Next.js router cache so the navbar updates without a manual page reload
- `/auth/error/page.tsx` — error page for auth failures

**Pages**
- `/` — landing page (Server Component)
- `/submit` — 3-step requirement submission form
- `/browse` — filterable, searchable, paginated requirements list (URL-driven, server-side)
- `/requirements/[id]` — full requirement detail with voting and comments

**API routes**
- `GET/POST /api/requirements` — list with filters/pagination; create (auth required)
- `GET/PATCH /api/requirements/[id]` — detail + user_vote; owner update (draft only)
- `POST/DELETE /api/requirements/[id]/vote` — upsert/remove vote; returns updated counts
- `GET/POST /api/requirements/[id]/comments` — paginated comments; post (auth required)

**Components**
- `Navbar` — sticky, shows Admin link only for admin users
- `NavbarUser` — client component for sign-in/out state
- `RequirementCard` — used on browse page
- `VoteButton` — optimistic vote UI
- `CommentForm` and `CommentList` — on detail page

### M3 — AI Refinement

- `POST /api/refine` — Claude API integration
  - Auth required
  - Rate limited: 10 refinements/user/hour (checked against `ai_usage_log`)
  - Daily cost cap: `CLAUDE_DAILY_COST_CAP_USD` env var (default $10), checked against `ai_usage_log` sum
  - Top 20 existing requirements injected into prompt for duplicate detection
  - Returns: `refined_title`, `user_story`, `refined_description`, `acceptance_criteria`, `persona_type`, `category`, `priority_suggestion`, `tags`, `clarifications_needed`, `similar_existing_titles`
  - Costs logged to `ai_usage_log` via service client
- `lib/claude/client.ts` — Anthropic SDK singleton
- `lib/claude/prompts.ts` — `REFINEMENT_SYSTEM_PROMPT` + `buildRefinementPrompt()`
- `lib/claude/parse.ts` — strips markdown fences, JSON.parse, validates required fields, enforces length caps
- Submit form (`components/submit/requirement-form.tsx`) — 3-step:
  1. Persona picker grid
  2. Textarea + category + "Refine with AI" + "Submit as draft" fallback
  3. Review AI output → Submit or Edit

**Model**: `claude-sonnet-4-20250514`, temperature 0.3, max_tokens 2000

### M4 — Admin Moderation

- `PATCH /api/requirements/[id]/review` — admin-only status transitions
- `lib/auth/admin.ts` — `isAdmin(user)` checks `user.email` against `ADMIN_EMAILS` env var (comma-split, lowercase)
- `/admin` page — server-gated, shows status stats + full queue
- `components/admin/admin-queue.tsx` — sortable table (in_review first), optimistic status updates
- `components/admin/review-actions.tsx` — Approve / Reject / Mark In Review buttons with spinner
- Approval email sent via Resend on status → `approved`
- Navbar shows Admin link (accent colour) for admin users only

**Admin emails configured**: `admin@sixdegrees.link,sudo@sixdegrees.link`

**Status transition rules**:
```
submitted  → in_review, approved, rejected
in_review  → approved, rejected
approved   → rejected
rejected   → in_review, approved
draft      → submitted, in_review, approved, rejected
```

### M5 — Consolidation & Export

- **DB migration** `20260402000000_m5_schema.sql` — `merged_into` FK, `is_flagged`/`flag_reason` on requirements and comments, `updated_at` on comments, `persona_subscriptions` table with RLS
- **AuthProvider** (`lib/auth/context.tsx`) — React context with `useAuth()` hook; wraps root layout
- **Comment edit/delete** — `PATCH/DELETE /api/requirements/[id]/comments/[commentId]`; `CommentSection` shows Edit/Delete for own comments, Flag for others
- **Leaderboard** (`/leaderboard`) — top contributors by approved submissions + upvotes received, with inline bar charts
- **Dashboard** (`/dashboard`) — persona coverage + category coverage bar charts, links to filtered browse
- **Deduplication/merge** — `PATCH /api/requirements/[id]/review` extended with `status=merged` + `merged_into`; `MergeDialog` component with live search in admin queue; `review-actions.tsx` updated
- **Export** (`GET /api/export?format=csv|json&status=approved`) — full requirements export; Export CSV button on browse page
- **Flag flow** — `POST /api/requirements/[id]/flag` and `POST /api/requirements/[id]/comments/[commentId]/flag`; flag button in requirement sidebar and on comments (non-owners)
- **Persona subscriptions** — `persona_subscriptions` table; `GET/POST/DELETE /api/subscriptions`
- **Navbar** — added Dashboard and Leaderboard links

**Updated status transition rules (now includes merged)**:
```
submitted  → in_review, approved, rejected, merged
in_review  → approved, rejected, merged
approved   → rejected, merged
rejected   → in_review, approved
draft      → submitted, in_review, approved, rejected
```

### Seed Data

15 initial requirements seeded from LinkedIn research doc, all in `approved` status.
Run `node scripts/seed-requirements.mjs` to re-seed (idempotent via insert, not upsert — don't run twice).

Categories covered: jobs, verification, content, messaging, analytics, microsites, billing, networking, admin.

---

## Architecture Decisions & Lessons Learned

### Service client must use `@supabase/supabase-js` directly

**Problem**: `createServiceClient()` was implemented using `createServerClient` from `@supabase/ssr`. When the service role key was passed to the SSR client, the cookie-based session conflicted with it, causing `.update()` queries to silently return 0 rows.

**Fix** (`lib/supabase/server.ts`):
```ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
```
Note: `createServiceClient()` is now **synchronous** (no `await` needed at call sites).

### Admin operations: anon client for auth check, service client for DB ops

The pattern in admin API routes:
```ts
const supabase = await createClient()          // anon — verify user identity
const { data: { user } } = await supabase.auth.getUser()
if (!isAdmin(user)) return 403

const service = createServiceClient()          // service role — bypass RLS for DB writes
```
Never use the service client to verify identity — it bypasses auth entirely.

### Auth callback: redirect response must be created BEFORE session exchange

**Problem**: Cookies set during `exchangeCodeForSession` weren't being attached to the redirect response because the response was created after the fact.

**Fix** (`app/auth/callback/route.ts`):
```ts
const response = NextResponse.redirect(confirmUrl)   // create response first
const supabase = createServerClient(..., {
  cookies: {
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)   // attach to the response
      )
    }
  }
})
await supabase.auth.exchangeCodeForSession(code)
return response
```

### Next.js router cache requires explicit bust after sign-in

After magic link auth, the Next.js router cache still served the pre-auth layout even though the session cookie was set. An intermediate `/auth/confirm` page calls `router.refresh()` before redirecting to the destination, which forces the router to re-fetch server components with the new auth state.

### `.single()` on `.update()` throws with service role

Supabase's `.single()` on an update query throws "Cannot coerce the result to a single JSON object" when used with the direct supabase-js client (not the SSR wrapper). Use array result and index instead:
```ts
const { data: rows, error } = await service
  .from('requirements')
  .update({ status: newStatus })
  .eq('id', id)
  .select('id, status')
// do NOT call .single() here

const updated = rows?.[0]
```

---

## File Map (current state)

```
app/
  layout.tsx                      ✅ Root layout — Inter font, GTM, Analytics, AuthProvider
  page.tsx                        ✅ Landing page
  globals.css                     ✅ Design system tokens + all component styles
  proxy.ts                        ✅ Supabase session refresh middleware
  auth/
    callback/route.ts             ✅ Magic link code exchange
    confirm/page.tsx              ✅ Router cache bust intermediate page
    error/page.tsx                ✅ Auth error page
  signin/page.tsx                 ✅ Sign-in page
  submit/page.tsx                 ✅ Submit requirement (3-step form with AI)
  browse/page.tsx                 ✅ Browse with URL-driven filters, search, pagination + Export CSV
  requirements/[id]/page.tsx      ✅ Requirement detail — voting, comments, flag
  dashboard/page.tsx              ✅ Persona + category coverage bar charts
  leaderboard/page.tsx            ✅ Top contributors by submissions + upvotes
  admin/page.tsx                  ✅ Admin moderation queue (admin-gated)
  api/
    requirements/route.ts         ✅ GET list + POST create
    requirements/[id]/route.ts    ✅ GET detail + PATCH owner update
    requirements/[id]/vote/       ✅ POST upsert + DELETE remove vote
    requirements/[id]/comments/   ✅ GET paginated + POST create
    requirements/[id]/comments/[commentId]/ ✅ PATCH edit + DELETE own comment
    requirements/[id]/comments/[commentId]/flag/ ✅ POST flag comment
    requirements/[id]/review/     ✅ PATCH admin status transition (incl. merged + merged_into)
    requirements/[id]/flag/       ✅ POST flag requirement
    refine/route.ts               ✅ Claude AI refinement
    export/route.ts               ✅ GET CSV/JSON export (?format=csv|json&status=approved)
    subscriptions/route.ts        ✅ GET/POST/DELETE persona subscriptions

components/
  navbar.tsx                      ✅ Sticky navbar — Browse, Contribute, Dashboard, Leaderboard, Admin
  navbar-user.tsx                 ✅ Client sign-in/out state
  admin/
    admin-queue.tsx               ✅ Sortable requirements table
    review-actions.tsx            ✅ Approve / Reject / In Review / Merge buttons
    merge-dialog.tsx              ✅ Live-search merge target dialog
  browse/
    filter-bar.tsx                ✅ Search + persona/category/status/sort filters
    requirement-card.tsx          ✅ Card used in browse grid
    pagination.tsx                ✅ Pagination controls
  requirements/
    comment-section.tsx           ✅ Comments with edit/delete (own) + flag (others)
    vote-buttons.tsx              ✅ Optimistic up/down vote UI
    flag-button.tsx               ✅ Flag button for requirements and comments
  submit/
    requirement-form.tsx          ✅ 3-step submit form
  auth/
    sign-in-form.tsx              ✅ Magic link sign-in form

lib/
  supabase/
    client.ts                     ✅ createBrowserClient (client components)
    server.ts                     ✅ createClient (anon SSR) + createServiceClient (service role, sync)
    types.ts                      ✅ Database types (updated for M5 columns)
  auth/
    admin.ts                      ✅ isAdmin(user) — checks ADMIN_EMAILS env
    context.tsx                   ✅ AuthProvider + useAuth() React context
  claude/
    client.ts                     ✅ Anthropic SDK singleton
    prompts.ts                    ✅ REFINEMENT_SYSTEM_PROMPT + buildRefinementPrompt()
    parse.ts                      ✅ parseRefinementResponse()
  validators/
    requirements.ts               ✅ Zod schemas — PersonaType, FeatureCategory, etc.
  constants/
    personas.ts                   ✅ PERSONAS array + CATEGORIES array (alphabetical, Other last)
  email.ts                        ✅ sendRequirementApproved() via Resend

scripts/
  seed-requirements.mjs           ✅ Seeds 15 initial requirements from LinkedIn research

supabase/migrations/
  20260401000000_initial_schema.sql   ✅ Tables, enums, indexes
  20260401000001_rls_policies.sql     ✅ Row-level security
  20260401000002_functions_triggers.sql ✅ Triggers + find_similar_requirements()
  20260402000000_m5_schema.sql        ✅ M5 — merged_into, is_flagged, flag_reason, updated_at, persona_subscriptions
```

---

## Feature Categories (current)

Alphabetical, `other` always last:
`accessibility`, `admin`, `analytics`, `billing`, `content`, `jobs`, `messaging`, `microsites`, `moderation`, `networking`, `notifications`, `profile`, `search`, `verification`, `other`

---

## Environment Variables (all set in Vercel + .env.local)

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
CLAUDE_DAILY_COST_CAP_USD=10
NEXT_PUBLIC_APP_URL=https://sixdegrees.link
ADMIN_EMAILS=admin@sixdegrees.link,sudo@sixdegrees.link
RESEND_API_KEY
EMAIL_FROM=noreply@sixdegrees.link
```

---

## Known Gaps / Deferred Items

- No pagination on comments (currently loads all, capped at 50 — acceptable for now)
- Persona subscription emails not yet sent (table + API exist; email digest not implemented)
- No GitHub Issues / Linear export (CSV + JSON only; deeper integrations deferred)
- Admin unflag UI not built (admins can clear flags via service client directly)
