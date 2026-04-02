# SixDegrees - Frontend Pages and Components

## Overview

The frontend is a Next.js App Router application with a Linear-inspired dark design system.
Mobile-first responsive. WCAG AA accessible. Target Lighthouse score: 90+.
Design philosophy: minimal friction. 2 clicks from landing to submitting a requirement.

See DESIGN_SYSTEM.md for all CSS tokens, component specs, and typography.

---

## Page Specifications

### 1. Landing Page (`/`)

**Purpose**: Explain the mission, inspire contributions, drive signups.

**Sections** (top to bottom):

1. **Navbar** (sticky) - Logo "SixDegrees" (16px, weight 590), nav links (Browse, Contribute, Dashboard, Leaderboard, Admin [admin only]), auth state (sign in link or email + sign out)

2. **Hero** - Manifesto-inspired headline (64px, weight 510, letter-spacing -1.408px). Subtitle (16px, tertiary). Two CTAs: "Contribute a Requirement" (primary) and "Browse Requirements" (secondary).

3. **How It Works** (3-step section) - Step 1: "Describe" (enter a feature idea in plain language), Step 2: "Refine" (Claude AI structures it), Step 3: "Vote" (community votes). Each step in a card with number badge, title (24px), description (13px).

4. **Personas Grid** - 2x5 or 3-column grid of cards. Each card: persona name, short description, requirement count badge. Click links to /browse?persona_type=X.

5. **Footer** - 4-column grid: Product, Community, Resources, Connect.

> **Note**: There is no `/api/requirements/stats` endpoint. Dashboard stats are queried directly in Server Components.

---

### 2. Submit Page (`/submit`)

**Purpose**: The core contribution flow. Quick, guided, AI-assisted.

**Auth gate**: If not authenticated, show inline email input at top before form.

**UX Flow**:
1. Pick persona type (required) - chip/pill selector for all 11 personas
2. Guiding prompts appear for selected persona (from constants/personas.ts)
3. Type requirement in plain language (large textarea, 4+ rows)
4. Optionally select category (dropdown)
5. Click "Refine with AI" - triggers Claude integration
6. Review side-by-side: original input (left) vs AI-refined output (right)
7. Edit refined version if needed
8. Click "Submit Requirement"
9. Success state with link to view and "Submit Another" option

**States**: Empty, Persona selected, Refining (loading), Refined (side-by-side), Editing, Submitting, Success, AI Error (fallback to manual), Similar found (dismissable panel).

**Component hierarchy**:
```
SubmitPage
├── Navbar
├── PersonaPicker (chip selector)
├── GuidingPrompts (per persona)
├── SubmitForm
│   ├── Textarea (raw input)
│   ├── Select (category)
│   └── Button ("Refine with AI")
├── RefinementView (after AI call)
│   ├── OriginalPanel (read-only)
│   ├── RefinedPanel (editable)
│   │   ├── Input (title)
│   │   ├── Textarea (user story)
│   │   ├── Textarea (description)
│   │   ├── CriteriaEditor
│   │   ├── Badge (priority)
│   │   └── TagEditor
│   └── SimilarRequirements (dismissable)
└── SuccessView
```

---

### 3. Browse Page (`/browse`)

**Purpose**: Explore all submitted requirements with filtering.

**Features**:
- Persona filter as scrollable pill tabs (all 11 + "All")
- Category dropdown filter
- Sort: Most Voted, Newest, Oldest
- Search bar with debounced full-text search
- Each row shows: persona badge, title, vote count, comment count, contributor, relative time
- Click row navigates to /requirements/[id]
- Pagination (20 per page)
- URL query params synced with filters (shareable URLs)
- Empty state: "No requirements match your filters. Be the first to contribute!"
- Loading state: skeleton rows

---

### 4. Requirement Detail (`/requirements/[id]`)

**Purpose**: Full requirement view with voting and discussion.

**Content**: Persona badge, category badge, status badge, title (24px, weight 590), user story (highlighted), description, acceptance criteria list, priority badge, tags as pills, original input (collapsible), contributor name and date.

**Interactions**: Vote buttons (optimistic UI, auth required), share button (copy URL, toast), flag button (modal with reason, auth required), comments (auth required to post, chronological).

---

### 5. Dashboard (`/dashboard`)

**Sections**:
1. Persona coverage — 11 rows, each with label, count, and proportional bar chart. Links to `/browse?persona_type=X`. Bars scale relative to the highest persona count.
2. Category coverage — 15 rows, same bar chart pattern. Links to `/browse?category=X`.

**Notes**: No stats cards or live stats bar. No color-coded thresholds. Data queried server-side from `requirements` table (approved + in_review + submitted). Server Component, no API route.

---

### 6. Leaderboard (`/leaderboard`)

Ranked table with columns: Rank (emoji medal for top 3), Contributor, Requirements (with bar), Upvotes received (with bar), Joined date. Sorted by submission count, then upvotes as tiebreak. No time filter, no achievement badges. Server Component — data aggregated from `requirements` joined to `contributors`.

---

### 7. Admin (`/admin`)

Admin-only (checked via `isAdmin(user)` against `ADMIN_EMAILS` env var). Status stats bar (all 6 states). Pending review queue (submitted + in_review). Sortable table with optimistic status updates, Review Actions (Approve / Reject / In Review / Merge). Merge opens `MergeDialog` — live search to find the canonical requirement. No bulk actions, no AI usage dashboard.

---

## Shared Components

| Component | Description |
|-----------|-------------|
| Navbar | Sticky, 73px, blur backdrop, logo, nav, auth, CTA |
| PersonaPicker | Grid of chip buttons, single select, icon + name |
| RequirementCard | Browse row: badge, title, votes, comments, contributor, time |
| VoteButtons | Up/down arrows with count, optimistic UI, auth gate |
| Badge/Pill | Persona, category, status, priority, tags (22px height) |
| Toast | Bottom-right notification, auto-dismiss 4s, stacks |
| Skeleton | Loading placeholder, animated pulse, shape-matched |
| Modal | Overlay dialog for flags and confirmations |
