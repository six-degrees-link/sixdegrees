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
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS + CSS custom properties | Latest |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth (magic links) | - |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| Hosting | Vercel | - |
| Icons | Lucide Icons | Latest |
| Validation | Zod | Latest |
| Font | Inter Variable | Latest |

## Project Structure

```
sixdegrees-requirements/
├── app/
│   ├── layout.tsx              # Root layout with Inter font, design tokens
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design system tokens (see DESIGN_SYSTEM.md)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # Magic link callback handler
│   ├── submit/
│   │   └── page.tsx            # Requirement submission form
│   ├── browse/
│   │   └── page.tsx            # Browse/filter requirements
│   ├── requirements/
│   │   └── [id]/
│   │       └── page.tsx        # Requirement detail with voting/comments
│   ├── dashboard/
│   │   └── page.tsx            # Coverage dashboard
│   ├── leaderboard/
│   │   └── page.tsx            # Contributor leaderboard
│   ├── admin/
│   │   └── page.tsx            # Moderation tools (admin-only)
│   └── api/
│       ├── requirements/
│       │   ├── route.ts        # GET (list), POST (create)
│       │   ├── [id]/
│       │   │   ├── route.ts    # GET (detail), PATCH (update)
│       │   │   ├── vote/
│       │   │   │   └── route.ts # POST (vote), DELETE (remove vote)
│       │   │   └── comments/
│       │   │       └── route.ts # GET (list), POST (create)
│       │   └── stats/
│       │       └── route.ts    # GET (dashboard stats)
│       └── refine/
│           └── route.ts        # POST (Claude AI refinement)
├── components/
│   ├── ui/                     # Design system components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Toggle.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   ├── ListItem.tsx
│   │   └── Navbar.tsx
│   ├── auth/
│   │   ├── AuthProvider.tsx    # Supabase auth context
│   │   └── EmailAuth.tsx       # Magic link email input
│   ├── requirements/
│   │   ├── SubmitForm.tsx      # Main submission form
│   │   ├── PersonaPicker.tsx   # Persona type selector
│   │   ├── RefinementView.tsx  # AI refinement side-by-side view
│   │   ├── RequirementCard.tsx # Card for browse list
│   │   ├── RequirementDetail.tsx
│   │   ├── VoteButtons.tsx
│   │   └── CommentThread.tsx
│   └── dashboard/
│       ├── StatsCards.tsx
│       ├── PersonaCoverage.tsx
│       └── TopVoted.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client (for API routes)
│   │   └── middleware.ts       # Auth middleware
│   ├── claude/
│   │   ├── refine.ts           # Claude API integration
│   │   ├── prompts.ts          # System prompt and templates
│   │   └── parse.ts            # Response parsing and validation
│   ├── validators/
│   │   └── requirements.ts     # Zod schemas
│   └── constants/
│       ├── personas.ts         # Persona definitions and prompts
│       └── categories.ts       # Feature categories
├── types/
│   ├── database.ts             # Supabase generated types
│   ├── requirements.ts         # Requirement-related types
│   └── api.ts                  # API request/response types
├── hooks/
│   ├── useAuth.ts
│   ├── useRequirements.ts
│   └── useVotes.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── docs/                       # These context files
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── AI_INTEGRATION.md
│   ├── FRONTEND.md
│   ├── DESIGN_SYSTEM.md
│   └── PERSONAS.md
├── .env.local                  # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

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
- Auth state managed via React context (`AuthProvider`)
- Protected routes check auth in middleware
- API routes verify auth via Supabase server client
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
