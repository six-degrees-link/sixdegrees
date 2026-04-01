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
| Styling | Tailwind CSS v4 + CSS custom properties | 4.x |
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
├── app/                                  # ✅ EXISTS
│   ├── layout.tsx                        # Root layout — next/font Inter, GTM, Analytics
│   ├── page.tsx                          # Landing page (Server Component)
│   ├── globals.css                       # Design system CSS tokens
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                  # Magic link code exchange handler
│   ├── submit/                           # 🔜 M2
│   │   └── page.tsx
│   ├── browse/                           # 🔜 M2
│   │   └── page.tsx
│   ├── requirements/[id]/                # 🔜 M2
│   │   └── page.tsx
│   ├── dashboard/                        # 🔜 M4
│   │   └── page.tsx
│   ├── leaderboard/                      # 🔜 M4
│   │   └── page.tsx
│   ├── admin/                            # 🔜 M4
│   │   └── page.tsx
│   └── api/
│       ├── requirements/                 # 🔜 M2
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── [id]/vote/route.ts
│       │   ├── [id]/comments/route.ts
│       │   └── stats/route.ts
│       └── refine/route.ts               # 🔜 M3
├── components/                           # 🔜 M2 — not yet created
├── lib/
│   ├── supabase/                         # ✅ EXISTS
│   │   ├── client.ts                     # createBrowserClient (@supabase/ssr)
│   │   ├── server.ts                     # createServerClient + createServiceClient
│   │   └── types.ts                      # Generated via: supabase gen types typescript
│   ├── claude/                           # 🔜 M3
│   ├── validators/                       # 🔜 M2
│   └── constants/                        # 🔜 M2
├── supabase/
│   └── migrations/                       # ✅ EXISTS — applied to production
│       ├── 20260401000000_initial_schema.sql
│       ├── 20260401000001_rls_policies.sql
│       └── 20260401000002_functions_triggers.sql
├── public/
│   └── favicon.svg
├── docs/                                 # These context files
├── proxy.ts                              # ✅ EXISTS — auth session refresh (Next.js 16)
├── .env.example                          # ✅ EXISTS
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

**Legend**: ✅ Built and deployed | 🔜 Planned (milestone noted)

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
- Auth state managed via React context (`AuthProvider`) — 🔜 M2
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
ADMIN_EMAILS=admin@sixdegrees.link
```

## Milestones

| # | Name | Target | Key Deliverables |
|---|------|--------|-----------------|
| M1 | Foundation and Setup | Apr 13 | Scaffolding, Supabase, Vercel, GitHub |
| M2 | Requirements Website Live | Apr 27 | Landing, auth, submit, browse, personas |
| M3 | AI-Powered Refinement | May 11 | Claude integration, streaming UX |
| M4 | Community Review | May 25 | Dashboard, leaderboard, moderation |
| M5 | Consolidation and Export | Jun 30 | Deduplication, export to Linear/GitHub/CSV |

## Design Philosophy

Dark-first, Linear-inspired design system. See DESIGN_SYSTEM.md for full tokens.
Key principles:
- No box-shadows anywhere - depth through background color stepping
- Compact and information-dense (30px control height, 13px UI text)
- Monochromatic with surgical accent (#828fff on interactive elements only)
- Inter Variable font with weight 510 as the signature weight
- Fast transitions (150ms), no spring animations
