# SixDegrees - Requirements Gathering Platform

## Mission

We are building a free, open-source professional network to replace LinkedIn.
Every user is verified. No bots. No AI slop. No surveillance economy.
The platform is yours. The code is yours. The network serves you or it answers to you.

**Website**: https://sixdegrees.link/
**Hosted on**: Vercel
**Timeline**: March 30 - June 30, 2026 (3 months)
**Team**: Volunteer contributors

## What This Application Is

This is the **requirements gathering website** for SixDegrees - not the social network itself.
It is a public tool where community members can:

1. Submit feature requirements in plain language
2. Have Claude AI refine them into structured user stories
3. Browse, vote on, and discuss requirements
4. View coverage dashboards across all user personas

The output is a prioritized, community-validated product backlog for the SixDegrees platform.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | Strict mode |
| Styling | Plain CSS custom properties (no Tailwind) | — |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth (magic links) | - |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| Hosting | Vercel | - |
| Icons | Lucide Icons | Latest |
| Validation | Zod | Latest |
| Font | Inter Variable (next/font) | Latest |

## Project Structure

```
sixdegrees/
├── app/
│   ├── layout.tsx                        # ✅ Root layout — Inter font, GTM, Analytics, metadata template
│   ├── page.tsx                          # ✅ Landing page (Server Component)
│   ├── globals.css                       # ✅ Design system CSS tokens
│   ├── proxy.ts                          # ✅ Supabase session refresh (Next.js 16 middleware replacement)
│   ├── auth/
│   │   ├── callback/route.ts             # ✅ Magic link code exchange → sets cookies → redirects to /auth/confirm
│   │   ├── confirm/page.tsx              # ✅ Client page: router.refresh() then router.replace(next)
│   │   └── error/page.tsx               # ✅ Auth error display
│   ├── signin/page.tsx                   # ✅ Sign-in page (magic link form)
│   ├── submit/page.tsx                   # ✅ 3-step requirement submission (auth required)
│   ├── browse/page.tsx                   # ✅ Filter/search/paginate requirements + Export CSV
│   ├── requirements/[id]/page.tsx        # ✅ Requirement detail — voting, comments, flag
│   ├── dashboard/page.tsx               # ✅ Persona + category coverage bar charts
│   ├── leaderboard/page.tsx             # ✅ Top contributors by submissions + upvotes
│   ├── admin/page.tsx                    # ✅ Admin moderation queue (isAdmin gated)
│   └── api/
│       ├── requirements/route.ts         # ✅ GET list + POST create
│       ├── requirements/[id]/route.ts    # ✅ GET detail + PATCH owner update
│       ├── requirements/[id]/vote/       # ✅ POST upsert + DELETE remove
│       ├── requirements/[id]/comments/   # ✅ GET paginated + POST create
│       ├── requirements/[id]/comments/[commentId]/ # ✅ PATCH edit + DELETE own comment
│       ├── requirements/[id]/comments/[commentId]/flag/ # ✅ POST flag comment
│       ├── requirements/[id]/review/     # ✅ PATCH admin status transition (incl. merged)
│       ├── requirements/[id]/flag/       # ✅ POST flag requirement
│       ├── refine/route.ts               # ✅ Claude AI refinement
│       ├── export/route.ts               # ✅ GET CSV/JSON export
│       └── subscriptions/route.ts        # ✅ GET/POST/DELETE persona subscriptions
├── components/
│   ├── navbar.tsx                        # ✅ Sticky navbar — Admin link for admin users only
│   ├── navbar-user.tsx                   # ✅ Client sign-in/out state
│   ├── admin/
│   │   ├── admin-queue.tsx               # ✅ Sortable moderation table with optimistic updates
│   │   ├── review-actions.tsx            # ✅ Approve/Reject/In Review/Merge buttons
│   │   └── merge-dialog.tsx              # ✅ Live-search merge target dialog
│   ├── browse/
│   │   ├── filter-bar.tsx                # ✅ Search + filters
│   │   ├── requirement-card.tsx          # ✅ Card used in browse grid
│   │   └── pagination.tsx                # ✅ Pagination controls
│   ├── requirements/
│   │   ├── comment-section.tsx           # ✅ Comments with edit/delete/flag
│   │   ├── vote-buttons.tsx              # ✅ Optimistic up/down vote UI
│   │   └── flag-button.tsx               # ✅ Flag button (requirements + comments)
│   ├── auth/
│   │   └── sign-in-form.tsx              # ✅ Magic link sign-in form
│   └── submit/
│       └── requirement-form.tsx          # ✅ 3-step form with AI refinement
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # ✅ createBrowserClient (@supabase/ssr, client components)
│   │   ├── server.ts                     # ✅ createClient (anon SSR) + createServiceClient (sync, supabase-js direct)
│   │   └── types.ts                      # ✅ Generated Supabase types (updated M5)
│   ├── claude/
│   │   ├── client.ts                     # ✅ Anthropic SDK singleton
│   │   ├── prompts.ts                    # ✅ REFINEMENT_SYSTEM_PROMPT + buildRefinementPrompt()
│   │   └── parse.ts                      # ✅ parseRefinementResponse()
│   ├── auth/
│   │   ├── admin.ts                      # ✅ isAdmin(user) — checks ADMIN_EMAILS env var
│   │   └── context.tsx                   # ✅ AuthProvider + useAuth() React context
│   ├── validators/
│   │   └── requirements.ts              # ✅ Zod schemas for all API inputs
│   ├── constants/
│   │   └── personas.ts                   # ✅ PERSONAS array + CATEGORIES array (alphabetical)
│   └── email.ts                          # ✅ sendRequirementApproved() via Resend
├── scripts/
│   └── seed-requirements.mjs            # ✅ Seeds 15 initial requirements (run once)
├── supabase/migrations/
│   ├── 20260401000000_initial_schema.sql   # ✅ Applied to production
│   ├── 20260401000001_rls_policies.sql     # ✅ Applied to production
│   ├── 20260401000002_functions_triggers.sql # ✅ Applied to production
│   └── 20260402000000_m5_schema.sql        # ✅ M5 — merged_into, is_flagged, flag_reason, persona_subscriptions
├── docs/
│   ├── build-progress.md                # ✅ Current build state, decisions, lessons learned
│   └── Requirements Gathering/          # ✅ Planning docs (arch, api, db, design, personas, ai, frontend)
├── public/
│   └── favicon.svg
├── .env.local                            # ✅ All keys set (see build-progress.md)
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

**Legend**: ✅ Built and deployed

> **Critical implementation notes** — see `docs/build-progress.md` for full details:
> - `createServiceClient()` is **synchronous** — uses `@supabase/supabase-js` directly, not `@supabase/ssr`
> - Admin API routes: use anon client for auth check, service client for DB ops
> - Auth callback: create redirect response BEFORE calling `exchangeCodeForSession`
> - Never call `.single()` on `.update()` with the service client — use array result + `[0]`

## Key Conventions

### Code Style
- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- `async/await` over `.then()` chains
- Zod for all API input validation
- All API responses follow: `{ data?: T, error?: string, code?: string }`
- Environment variables prefixed with `NEXT_PUBLIC_` for client-side only

### Naming
- Components: PascalCase (`RequirementCard.tsx`)
- Hooks: camelCase with `use` prefix (`useRequirements.ts`)
- API routes: kebab-case paths
- Database columns: snake_case
- TypeScript types: PascalCase
- Constants: SCREAMING_SNAKE_CASE for enums, camelCase for objects

### Error Handling
- API routes: try/catch with consistent error response format
- Client: toast notifications for user-facing errors
- Supabase: always check `.error` on responses
- Claude API: timeout after 30s, retry once on parse failure

### Authentication
- Supabase magic links (email-only, no passwords)
- Auth state managed via `AuthProvider` in `lib/auth/context.tsx` — use `useAuth()` in client components
- Protected routes checked in `proxy.ts` (Next.js 16 replacement for `middleware.ts`)
- API routes verify auth via `createClient()` from `lib/supabase/server.ts`
- Service-role operations use `createServiceClient()` (bypasses RLS, API routes only)
- No registration wall - auth happens inline on the submit page

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=your-claude-api-key
CLAUDE_DAILY_COST_CAP_USD=10

# App
NEXT_PUBLIC_APP_URL=https://sixdegrees.link
ADMIN_EMAILS=admin@sixdegrees.link,sudo@sixdegrees.link
```

## Milestones

| # | Name | Target | Key Deliverables |
|---|------|--------|-----------------|
| M1 | Foundation and Setup | Apr 13 | ✅ Scaffolding, Supabase, Vercel, GitHub |
| M2 | Requirements Website Live | Apr 27 | ✅ Landing, auth, submit, browse, requirement detail |
| M3 | AI-Powered Refinement | May 11 | ✅ Claude integration, 3-step form, rate limiting |
| M4 | Community Review | May 25 | ✅ Admin moderation queue, status transitions, approval email |
| M5 | Consolidation and Export | Jun 30 | ✅ Dedup/merge, export, dashboard, leaderboard, flag flow, subscriptions, AuthProvider |

## Design Philosophy

Dark-first, Linear-inspired design system. See DESIGN_SYSTEM.md for full tokens.
Key principles:
- No box-shadows anywhere - depth through background color stepping
- Compact and information-dense (30px control height, 13px UI text)
- Monochromatic with surgical accent (#828fff on interactive elements only)
- Inter Variable font with weight 510 as the signature weight
- Fast transitions (150ms), no spring animations
