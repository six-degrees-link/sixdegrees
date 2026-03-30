# SixDegrees — Claude Context

## What This Project Is

This repo currently contains the **landing/marketing site** for SixDegrees — a free, open-source professional network built to replace LinkedIn. The repo will grow to include the full requirements-gathering platform.

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

## Current State (Landing Site)

**Stack**: Vite + React (JSX), plain CSS, hosted on Vercel

```
src/
  App.jsx        # Root component — navbar, hero, manifesto, footer
  main.jsx       # React entry point
index.html
vite.config.js
```

**Installed packages**:
- `@vercel/analytics` — `<Analytics />` added to App.jsx
- `@vercel/speed-insights` — `<SpeedInsights />` added to App.jsx

---

## Planned Application: Requirements Gathering Platform

The next major build is a **public requirements gathering tool** where community members submit feature requests, Claude AI refines them into structured user stories, and the community votes/discusses them.

### Planned Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js App Router (TypeScript, strict mode) |
| Styling | Tailwind CSS + CSS custom properties |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth — magic links only (no passwords) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Icons | Lucide Icons |
| Validation | Zod |
| Font | Inter Variable |

### Key Routes (planned)
- `/` — landing page
- `/submit` — requirement submission form with AI refinement
- `/browse` — browse/filter/search requirements
- `/requirements/[id]` — detail view with voting and comments
- `/dashboard` — persona coverage dashboard
- `/leaderboard` — contributor leaderboard
- `/admin` — moderation tools (admin-only)

### API Routes (planned)
- `POST /api/refine` — Claude AI refinement (auth required)
- `GET/POST /api/requirements` — list and create
- `GET/PATCH /api/requirements/[id]` — detail and update
- `POST/DELETE /api/requirements/[id]/vote` — voting
- `GET/POST /api/requirements/[id]/comments`
- `GET /api/requirements/stats` — dashboard stats

---

## AI Integration

Claude is used to transform plain-language feature requests into structured user stories.

- **Model**: `claude-sonnet-4-20250514`
- **Temperature**: 0.3 (consistency over creativity)
- **Max tokens**: 2000
- **Daily cost cap**: `CLAUDE_DAILY_COST_CAP_USD` env var (default $10)
- **Fallback**: when AI unavailable, submit with raw input only (status: `draft`)
- **Cost**: ~$0.011/refinement → ~900 refinements/day at $10 cap

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

`profile`, `messaging`, `search`, `jobs`, `content`, `networking`, `verification`, `admin`, `billing`, `notifications`, `analytics`, `microsites`, `moderation`, `other`

---

## Database (Supabase/PostgreSQL)

Key tables: `contributors`, `requirements`, `requirement_votes`, `requirement_comments`, `persona_subscriptions`, `ai_usage_log`

- RLS enabled on all tables
- Auth via Supabase Auth — contributor created automatically on first login via trigger
- Vote/comment counts are denormalized on `requirements` and kept in sync via DB triggers
- Full-text search via `tsvector` generated column + GIN index
- Duplicate detection via `pg_trgm` similarity + `find_similar_requirements()` function

Requirement status flow: `draft` → `submitted` → `in_review` → `approved` / `rejected` / `merged`

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

---

## Environment Variables (planned)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
CLAUDE_DAILY_COST_CAP_USD=10
NEXT_PUBLIC_APP_URL=https://sixdegrees.link
ADMIN_EMAILS=admin@sixdegrees.link
```

---

## Milestones

| # | Name | Target |
|---|------|--------|
| M1 | Foundation & Setup | Apr 13, 2026 |
| M2 | Requirements Website Live | Apr 27, 2026 |
| M3 | AI-Powered Refinement | May 11, 2026 |
| M4 | Community Review | May 25, 2026 |
| M5 | Consolidation & Export | Jun 30, 2026 |
