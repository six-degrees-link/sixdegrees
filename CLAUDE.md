# SixDegrees — Claude Context

## What This Project Is

This repo contains the **requirements gathering platform** for SixDegrees — a free, open-source professional network built to replace LinkedIn. Community members submit feature requests, Claude AI refines them into structured user stories, and the community votes and discusses them.

**Mission**: Every user verified. No bots. No AI slop. No surveillance economy. No premium tier. The platform is yours.

## Manifesto (Core Voice & Values)

> We're done pretending LinkedIn works. It stopped being a professional network years ago. It became a content farm, a bot playground, a place where your uncle posts AI-written motivation porn and recruiters ghost you after three rounds of interviews.
>
> We are building something that should have existed all along. A professional network that is free. Open source. Built in the open, for everyone. A place where every single person is verified, their identity confirmed, their credentials real. No bots. No AI slop. No engagement-bait ghostwritten by ChatGPT and posted by someone who calls themselves a "thought leader." If you are here, you are a real human being with real skills and something real to say.
>
> Content creators get professional micro sites they actually own, not some algorithm-choked feed that buries their work unless they pay to boost it. There is no premium tier. There is no "creator mode." There is no surveillance economy running underneath it all, packaging your attention and selling it to the highest bidder.
>
> The platform is yours. The code is yours. The network serves you or it answers to you, because you are not the product here.

**Tone guidance**: When writing copy, UI text, error messages, or any user-facing content for this project, match this voice — direct, frustrated with the status quo, anti-corporate, plainspoken. No marketing fluff. No "empower your professional journey" language. Say what you mean.

**Website**: https://sixdegrees.link/
**Hosting**: Vercel
**Timeline**: March 30 – June 30, 2026 (volunteer contributors)
**Repo**: https://github.com/six-degrees-link/sixdegrees (migrated from GitLab)

---

## Current State

All 5 milestones complete as of 2026-04-02. The platform is fully built and live.

**Stack**

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router (TypeScript, strict mode) |
| Styling | Plain CSS custom properties (no Tailwind) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth — magic links only (no passwords) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Icons | Lucide Icons |
| Validation | Zod |
| Font | Inter Variable |
| Email | Resend |
| Analytics | `@vercel/analytics`, `@vercel/speed-insights`, Google Tag Manager |

**Pages**
- `/` — landing page (Server Component)
- `/signin` — magic link sign-in
- `/submit` — 3-step requirement submission form with AI refinement
- `/browse` — filterable, searchable, paginated requirements list (URL-driven, server-side)
- `/requirements/[id]` — full requirement detail with voting and comments
- `/dashboard` — persona + category coverage bar charts
- `/leaderboard` — top contributors by submissions and upvotes
- `/admin` — moderation queue (admin-gated)

**API Routes**
- `POST /api/refine` — Claude AI refinement (auth required)
- `GET/POST /api/requirements` — list with filters/pagination; create
- `GET/PATCH /api/requirements/[id]` — detail + user vote; owner update
- `POST/DELETE /api/requirements/[id]/vote` — upsert/remove vote
- `GET/POST /api/requirements/[id]/comments` — paginated; post (auth required)
- `PATCH/DELETE /api/requirements/[id]/comments/[commentId]` — edit/delete own comment
- `POST /api/requirements/[id]/comments/[commentId]/flag` — flag comment
- `PATCH /api/requirements/[id]/review` — admin status transition (incl. merge)
- `POST /api/requirements/[id]/flag` — flag requirement
- `GET /api/export` — download requirements as CSV or JSON (`?format=csv|json&status=approved`)
- `GET/POST/DELETE /api/subscriptions` — persona subscriptions

---

## AI Integration

Claude is used to transform plain-language feature requests into structured user stories.

- **Model**: `claude-sonnet-4-20250514`
- **Temperature**: 0.3 (consistency over creativity)
- **Max tokens**: 2000
- **Daily cost cap**: `CLAUDE_DAILY_COST_CAP_USD` env var (default $10)
- **Fallback**: when AI unavailable, submit with raw input only (status: `draft`)
- **Cost**: ~$0.011/refinement → ~900 refinements/day at $10 cap
- **Rate limit**: 10 refinements/user/hour (checked against `ai_usage_log`)

Claude returns structured JSON with: `refined_title`, `user_story`, `refined_description`, `acceptance_criteria`, `persona_type`, `category`, `priority_suggestion`, `tags`, `clarifications_needed`, `similar_existing_titles`

Duplicate detection uses two layers:
1. PostgreSQL `pg_trgm` similarity (pre-AI)
2. Claude context injection (top 20 existing requirements passed in prompt)

---

## User Personas (11 types)

| Type | Label | Icon |
|------|-------|------|
| `general_user` | Connected Professional | User |
| `job_seeker` | Job Seeker | Search |
| `employer` | Employer | Building2 |
| `recruiter` | Recruiter | Users |
| `content_moderator` | Content Moderator | Shield |
| `content_creator` | Content Creator | PenTool |
| `company` | Company | Building |
| `service_provider` | Service Provider | Wrench |
| `coach` | Coach | Compass |
| `educator` | Educator | GraduationCap |
| `platform_admin` | Platform Admin | Settings |

---

## Feature Categories

Alphabetical, `other` always last:

`accessibility`, `admin`, `analytics`, `billing`, `content`, `jobs`, `messaging`, `microsites`, `moderation`, `networking`, `notifications`, `profile`, `search`, `verification`, `other`

---

## Database (Supabase/PostgreSQL)

Tables: `contributors`, `requirements`, `requirement_votes`, `requirement_comments`, `persona_subscriptions`, `ai_usage_log`

- RLS enabled on all tables
- Auth via Supabase Auth — contributor created automatically on first login via trigger
- Vote/comment counts are denormalized on `requirements` and kept in sync via DB triggers
- Full-text search via `tsvector` generated column + GIN index
- Duplicate detection via `pg_trgm` similarity + `find_similar_requirements()` function

**Requirement status flow**: `draft` → `submitted` → `in_review` → `approved` / `rejected` / `merged`

**Status transitions**:
```
submitted  → in_review, approved, rejected, merged
in_review  → approved, rejected, merged
approved   → rejected, merged
rejected   → in_review, approved
draft      → submitted, in_review, approved, rejected
```

When merging: `merged_into` UUID must be provided. Set alongside `status = merged`.

---

## Design System (Linear-Inspired)

**Philosophy**: Dark-first, depth through background color stepping (no box-shadows ever). Compact (30px controls, 13px UI text). Monochromatic with surgical accent `#828fff`. Inter Variable weight 510 is the signature. No gradients, no glows, fast transitions (150ms).

### Key Design Tokens

```
--bg-page: #08090a       --text-primary: #f7f8f8
--bg-card: #0f1011       --text-secondary: #d0d6e0
--bg-elevated: #161718   --text-tertiary: #8a8f98
--bg-input: #1a1b1e      --text-muted: #6b6f76
--bg-hover: #1c1e21      --accent-primary: #828fff
--border-default: #1c1e21
--border-input: #2a2d32
```

### Typography

- Hero: 64px / weight 510 / letter-spacing -1.408px
- Page Title: 48px / weight 510 / letter-spacing -1.056px
- Card Heading: 24px / weight 590 / letter-spacing -0.288px
- UI Label / buttons: 13px / weight 510
- Body text: 17px / weight 400 — use `--text-secondary`, not `--text-primary`
- All headings 24px+ MUST have negative letter-spacing

### Components
- **Buttons**: primary (light bg `#e6e6e6`, dark text), secondary (`#2d2e31`), ghost (transparent)
- **Inputs**: 30px height, 8px radius, 0.5px border `#2a2d32`, focus → `#828fff`
- **Cards**: `#0f1011`, 16px radius, `1px solid #1c1e21`, hover → `#23252a`, **no shadows**
- **Badges**: 22px height, `border-radius: 9999px`, translucent colored backgrounds
- **Navbar**: 73px, sticky, `backdrop-blur(20px)`, `rgba(8,9,10,0.8)` bg
- **Icons**: Lucide, 1.5px stroke, 16–20px, default color `#8a8f98`

---

## Code Conventions

- Functional components + hooks only (no class components)
- Named exports for components, default exports for pages
- `async/await` over `.then()` chains
- Zod for all API input validation
- API responses: `{ data?: T, error?: string, code?: string }`
- Components: PascalCase | Hooks: camelCase `use` prefix | DB columns: snake_case
- Error: toast for user-facing, `console.error` + structured response for API
- Service client (`createServiceClient()`) is **synchronous** — no `await` at call sites
- Admin routes: anon client for identity check, service client for DB writes (bypasses RLS)
- AuthProvider (`lib/auth/context.tsx`) wraps root layout — use `useAuth()` in client components for user state

---

## Environment Variables

All set in Vercel + `.env.local`:

```
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

## Milestones

All complete.

| # | Name | Status |
|---|------|--------|
| M1 | Foundation & Setup | ✅ |
| M2 | Requirements Website Live | ✅ |
| M3 | AI-Powered Refinement | ✅ |
| M4 | Community Review (Admin Moderation) | ✅ |
| M5 | Consolidation & Export | ✅ |
