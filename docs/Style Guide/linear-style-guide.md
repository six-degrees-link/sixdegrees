# Linear-Inspired Style Guide

> **Purpose**: This document is a design system reference extracted from Linear's live application and marketing site. It is structured for AI code generation tools (Cursor, Claude, Copilot, v0, etc.) to produce consistent, Linear-quality UI. Feed this entire file as context when prompting.

---

## 1. Design Philosophy

When building UI in this style, follow these core principles:

- **Dark-first, depth through tone** — No box-shadows anywhere. Depth is created purely through background color stepping (page → card → elevated → hover). Each step is a barely-perceptible lightening.
- **Compact & information-dense** — Controls are small (30px height), text is 13px for UI labels, padding is restrained. Prioritize information density without feeling cramped.
- **Monochromatic with surgical accent** — The interface is almost entirely grayscale. The purple-blue accent (`#828fff`) appears only on interactive links, active toggles, and focus rings. Use it sparingly.
- **Tight letter-spacing on headings** — All headings above 24px use negative letter-spacing. This gives the typography its premium, designed feel.
- **Weight 510 is the signature** — Inter's 510 weight is Linear's distinctive choice for hero headings, buttons, labels, and links. Heavier than 500, lighter than 600.
- **No decoration, no embellishment** — No gradients on UI elements, no glows, no rounded-everything. Borders are thin (0.5–1px), corners are modest (4–16px), transitions are fast (150ms).

---

## 2. CSS Custom Properties (Design Tokens)

Copy this block into your project's root stylesheet. These tokens capture the complete Linear design language.

```css
:root {
  /* ── Backgrounds ── */
  --bg-page:       #08090a;   /* Main page / body background */
  --bg-sidebar:    #090909;   /* Sidebar panel background */
  --bg-base:       #0f0f11;   /* Base content area */
  --bg-card:       #0f1011;   /* Card surfaces */
  --bg-elevated:   #161718;   /* Elevated surfaces (tooltips, dropdowns, code blocks) */
  --bg-input:      #1a1b1e;   /* Input fields, selects */
  --bg-hover:      #1c1e21;   /* Hover state on list items, sidebar items */
  --bg-active:     #1e2023;   /* Active/selected state */
  --bg-overlay:    rgba(0, 0, 0, 0.6); /* Modal/dialog overlays */

  /* ── Borders ── */
  --border-default:  #1c1e21;                   /* Default card/section borders */
  --border-subtle:   rgba(255, 255, 255, 0.08); /* Navbar bottom border, dividers */
  --border-input:    #2a2d32;                   /* Input/select borders */
  --border-strong:   #23252a;                   /* Footer top border, hover card borders */

  /* ── Text ── */
  --text-primary:    #f7f8f8;  /* Headings, titles, primary content */
  --text-secondary:  #d0d6e0;  /* Body text, descriptions, card subtitles */
  --text-tertiary:   #8a8f98;  /* Nav links, placeholders on buttons, metadata */
  --text-muted:      #6b6f76;  /* Disabled labels, sidebar section headers, timestamps */
  --text-disabled:   #4a4d54;  /* Fully disabled content */
  --text-inverse:    #08090a;  /* Text on light/primary buttons */

  /* ── Accent ── */
  --accent-primary:  #828fff;  /* Links, active toggles, focus rings */
  --accent-hover:    #9ba3ff;  /* Accent hover state */

  /* ── Status Colors ── */
  --status-green:    #4ade80;  /* Done, success, active */
  --status-yellow:   #fbbf24;  /* In progress, warning */
  --status-orange:   #f97316;  /* Needs attention */
  --status-red:      #ef4444;  /* Urgent, error, destructive */
  --status-blue:     #5e6ad2;  /* In review, informational */
  --status-purple:   #8b5cf6;  /* Custom/special states */

  /* ── Button Colors ── */
  --btn-primary-bg:    #e6e6e6;  /* Primary CTA (light on dark) */
  --btn-primary-text:  #08090a;
  --btn-secondary-bg:  #2d2e31;  /* Secondary button surface */
  --btn-secondary-text:#e4e5e9;
  --btn-ghost-text:    #8a8f98;  /* Ghost button text */

  /* ── Typography ── */
  --font-sans: 'Inter Variable', 'Inter', 'SF Pro Display', -apple-system, system-ui,
               'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
               'Helvetica Neue', sans-serif;

  /* ── Border Radius ── */
  --radius-xs:   4px;     /* Small buttons, nav CTA */
  --radius-sm:   6px;     /* Medium buttons */
  --radius-md:   8px;     /* Inputs, selects, sidebar items */
  --radius-lg:   12px;    /* Compact cards, settings groups */
  --radius-xl:   16px;    /* Feature cards, large cards */
  --radius-full: 9999px;  /* Pills, badges, filter tabs */

  /* ── Layout ── */
  --sidebar-width:  244px;
  --navbar-height:  73px;
  --max-content:    1120px;
}
```

### Font Feature Settings

Always apply these to the body or root element for proper Inter rendering:

```css
html {
  font-family: var(--font-sans);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  text-rendering: optimizeLegibility;
}

body {
  background: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.5;
}
```

---

## 3. Typography Scale

Linear uses Inter Variable exclusively. The type scale is tight and controlled with negative letter-spacing on headings.

| Name | Size | Weight | Letter-Spacing | Line-Height | Usage |
|------|------|--------|---------------|-------------|-------|
| Hero | 64px | 510 | -1.408px | 1.06 | Marketing hero headings |
| Page Title | 48px | 510 | -1.056px | 1.1 | Page-level titles (Pricing, Features) |
| Section Headline | 40px | 510 | -0.88px | 1.15 | CTA taglines, large section headers |
| Article Heading | 32px | 590 | -0.704px | 1.125 | Blog/changelog article titles |
| Card Heading | 24px | 590 | -0.288px | 1.2 | Pricing tier names, card titles |
| Body (Long-form) | 17px | 400 | normal | 1.6 | Blog body text, changelog descriptions |
| App Section Header | 15px | 600 | normal | 1.4 | "Activity", "General", setting section titles |
| UI Label | 13px | 510 | -0.13px | 1.5 | Buttons, category labels, sidebar items, nav |
| Description | 12px | 450 | normal | 1.4 | Helper text, setting descriptions, metadata |
| Micro | 11px | 400 | normal | 1.3 | Timestamps, counters, very small metadata |

### Font Weight Reference

| Value | Name | When to Use |
|-------|------|-------------|
| 400 | Regular | Body text, nav links, descriptions, long-form content |
| 450 | Book | Setting descriptions, helper text, subtle labels |
| 500 | Medium | Filter tabs, status group headers, sidebar section labels, footer headings |
| 510 | Semibold | **THE signature weight.** Hero headings, buttons, category labels, CTA links |
| 590 | Bold | Article headings, pricing tier names, card titles |
| 600 | Heavy | App section headers like "Activity", "Properties" |

### Implementation Notes

- All headings 24px+ MUST have negative letter-spacing
- Body text color is `--text-secondary` (#d0d6e0), NOT `--text-primary`
- Placeholder text uses `--text-muted` (#6b6f76)
- Inline links in body text use `--text-primary` with weight 510 (no underline)
- External/CTA links use `--accent-primary` (#828fff) with weight 510

---

## 4. Spacing Scale

Linear uses a pragmatic spacing scale. Small elements use 4–12px steps; sections use 32–80px.

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight internal gaps, icon-to-text |
| space-2 | 8px | Small gaps between related elements |
| space-3 | 10px | Sidebar item horizontal padding, pill padding |
| space-4 | 12px | Card grid gaps, button horizontal padding, input padding |
| space-5 | 16px | Standard component spacing, card grid gaps |
| space-6 | 20px | Nav link spacing |
| space-7 | 24px | Card internal padding, section sub-gaps |
| space-8 | 32px | Card top/bottom padding, between subsections |
| space-9 | 40px | Between major sections (within a page) |
| space-10 | 48px | Page title to content gap |
| space-11 | 64px | Major page sections |
| space-12 | 80px | Top-level page padding, hero sections |

---

## 5. Component Specifications

### 5.1 Buttons

Linear buttons are minimal. The primary CTA inverts the color scheme (light bg, dark text). No gradients, no shadows.

#### Primary Button (CTA)
```css
.btn-primary {
  background: #e6e6e6;
  color: #08090a;
  font-size: 13px;
  font-weight: 510;
  height: 32px;              /* sm: 28px, lg: 36px */
  padding: 0 14px;           /* sm: 0 10px, lg: 0 18px */
  border-radius: 4px;        /* sm: 4px, md: 6px, lg: 8px */
  border: 1px solid #e6e6e6;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: #ffffff;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: #2d2e31;
  color: #e4e5e9;
  font-size: 13px;
  font-weight: 510;
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid #2a2d32;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-secondary:hover {
  background: #3a3b3f;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #8a8f98;
  font-size: 13px;
  font-weight: 510;
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}
.btn-ghost:hover {
  color: #d0d6e0;
  background: #1c1e21;
}
```

#### Danger Button
```css
.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
  /* same sizing as secondary */
}
```

#### Button Sizes

| Size | Height | Padding | Border-Radius |
|------|--------|---------|---------------|
| Small | 28px | 0 10px | 4px |
| Medium (default) | 32px | 0 14px | 6px |
| Large | 36px | 0 18px | 8px |

---

### 5.2 Form Controls

#### Text Input
```css
.input {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #d0d6e0;
  background: #1a1b1e;
  border: 0.5px solid #2a2d32;
  border-radius: 8px;
  padding: 6px 10px;
  height: 30px;
  outline: none;
  transition: border-color 0.15s ease;
}
.input:focus {
  border-color: #828fff;
}
.input::placeholder {
  color: #6b6f76;
}
```

#### Select / Dropdown
```css
.select {
  appearance: none;
  font-family: var(--font-sans);
  font-size: 13px;
  color: #d0d6e0;
  background: #1a1b1e;
  border: 0.5px solid #2a2d32;
  border-radius: 8px;
  padding: 1px 28px 1px 10px;
  height: 30px;
  cursor: pointer;
  outline: none;
  /* Add a chevron icon to the right side with CSS or an SVG */
}
```

#### Toggle Switch
```css
.toggle {
  width: 36px;
  height: 20px;
  background: #1c1e21;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}
.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8a8f98;
  transition: transform 0.2s ease, background 0.2s ease;
}
.toggle[data-active="true"] {
  background: #828fff;
}
.toggle[data-active="true"]::after {
  transform: translateX(16px);
  background: white;
}
```

---

### 5.3 Cards

Cards are the primary content container. No shadows — ever.

```css
.card {
  background: #0f1011;
  border-radius: 16px;
  padding: 32px 24px;
  border: 1px solid #1c1e21;
  transition: border-color 0.2s ease;
}
.card:hover {
  border-color: #23252a;
}
```

#### Card Anatomy
- **Category label**: 13px, weight 510, color `#d0d6e0`, with a small colored dot (8px circle)
- **Title**: 24px, weight 590, color `#f7f8f8`, letter-spacing -0.288px
- **Arrow indicator**: A `›` chevron in the bottom-right corner, color `#8a8f98`

#### Compact Card (settings, smaller grids)
```css
.card-compact {
  padding: 16px;
  border-radius: 12px;
}
```

---

### 5.4 Navigation

#### Top Navbar
```css
.navbar {
  height: 73px;
  background: rgba(8, 9, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}
```

- Nav links: 16px, weight 400, color `#8a8f98`, hover → `#f7f8f8`
- Logo text: 16px, weight 590, color `#f7f8f8`
- CTA button: Primary button (small size, 28px height, 4px radius)

#### Sidebar
```css
.sidebar {
  width: 244px;
  background: #090909;
  padding: 16px 8px;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: #d0d6e0;
  cursor: pointer;
  transition: background 0.1s ease;
  text-decoration: none;
}
.sidebar-item:hover {
  background: #1c1e21;
}
.sidebar-item.active {
  background: #1e2023;
  color: #f7f8f8;
}

.sidebar-section-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b6f76;
  padding: 16px 10px 4px 10px;
  text-transform: none;  /* Linear does NOT uppercase these */
}
```

---

### 5.5 List / Table Rows (Issue List)

```css
.list-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  border-bottom: 1px solid #1c1e21;
  font-size: 13px;
  color: #f7f8f8;
  transition: background 0.1s ease;
  cursor: pointer;
}
.list-item:hover {
  background: #1c1e21;
}
```

#### Row Anatomy (left to right)
1. **Priority icon** — 3 dots or icon, color `#6b6f76`
2. **Identifier** — e.g. "SIX-7", 13px, color `#6b6f76`
3. **Status dot** — 14px circle with 1.5px colored border
4. **Title text** — 13px, weight 400, color `#f7f8f8`
5. **Right metadata** — labels/badges, assignee avatar, date (12px, `#6b6f76`)

#### Group Header (status grouping)
```css
.group-header {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #d0d6e0;
  background: #161718;
  display: flex;
  align-items: center;
  gap: 8px;
}
/* Colored status dot before text, count in muted color after */
```

---

### 5.6 Badges & Pills

```css
.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
  gap: 4px;
}

/* Filter tab (inactive) */
.badge-default {
  background: #161718;
  color: #d0d6e0;
}

/* Filter tab (active) */
.badge-active {
  background: #1e2023;
  color: #f7f8f8;
}

/* Status badges — use translucent background + matching text */
.badge-green  { background: rgba(74, 222, 128, 0.12); color: #4ade80; }
.badge-yellow { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }
.badge-red    { background: rgba(239, 68, 68, 0.12);  color: #ef4444; }
.badge-blue   { background: rgba(94, 106, 210, 0.15); color: #828fff; }
```

---

### 5.7 Settings Pattern

Settings pages use grouped rows inside a card container with a section header above.

```css
.settings-section-header {
  font-size: 15px;
  font-weight: 500;
  color: #f7f8f8;
  margin-bottom: 12px;
}

.settings-group {
  background: #0f1011;
  border-radius: 12px;
  border: 1px solid #1c1e21;
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #1c1e21;
}
.settings-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: #f7f8f8;
}

.setting-description {
  font-size: 12px;
  font-weight: 450;
  color: #6b6f76;
  margin-top: 2px;
}
```

---

### 5.8 Links

Three distinct link styles:

```css
/* Accent link — used for CTAs, "Make the switch ›", "Read more" */
.link-accent {
  color: #828fff;
  text-decoration: none;
  font-weight: 510;
  font-size: 16px;
}
.link-accent:hover { color: #9ba3ff; }

/* Inline link — used within body text */
.link-inline {
  color: #e4e5e9;
  text-decoration: none;
  font-weight: 510;
}
.link-inline:hover { text-decoration: underline; }

/* Muted link — used in footers, nav, metadata */
.link-muted {
  color: #8a8f98;
  text-decoration: none;
  font-size: 13px;
}
.link-muted:hover { color: #d0d6e0; }
```

---

### 5.9 Footer

```css
.footer {
  border-top: 1px solid #23252a;
  padding: 40px 24px;
  background: #08090a;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 32px;
}

.footer-heading {
  font-size: 13px;
  font-weight: 500;
  color: #f7f8f8;
  margin-bottom: 12px;
}

.footer-link {
  display: block;
  font-size: 13px;
  color: #8a8f98;
  text-decoration: none;
  line-height: 2;
}
.footer-link:hover { color: #d0d6e0; }
```

---

## 6. Layout Patterns

### App Shell (Sidebar + Content)
```
┌──────────────────────────────────────────────┐
│ Navbar (73px, sticky, blur backdrop)         │
├────────────┬─────────────────────────────────┤
│ Sidebar    │ Main Content Area               │
│ 244px      │ bg: #0f0f11                     │
│ bg: #090909│                                 │
│            │ ┌─ Filter Tabs ──────────────┐  │
│ - Inbox    │ │ [All] [Active] [Backlog]   │  │
│ - My issues│ └────────────────────────────┘  │
│            │                                 │
│ Workspace  │ ┌─ Group Header ─────────────┐  │
│ - Projects │ │ ● In Progress  3           │  │
│ - Views    │ ├────────────────────────────┤  │
│            │ │ ··· SIX-7 ● Issue title    │  │
│ Teams      │ │ ··· SIX-6 ● Issue title    │  │
│ - Issues ← │ │ ··· SIX-5 ● Issue title    │  │
│ - Projects │ └────────────────────────────┘  │
│ - Views    │                                 │
└────────────┴─────────────────────────────────┘
```

### Marketing Page Layout
```
┌──────────────────────────────────────────────┐
│ Navbar (sticky, blur)                        │
│ [Logo]        [Product] [Pricing] [Docs] [CTA]
├──────────────────────────────────────────────┤
│                                              │
│   Hero Heading (64px, weight 510)            │
│   Subtitle (16px, tertiary color)            │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│   ┌─ Card ─────────┐  ┌─ Card ─────────┐    │
│   │ Category  ›     │  │ Category  ›     │    │
│   │ Card Title      │  │ Card Title      │    │
│   └─────────────────┘  └─────────────────┘    │
│                                              │
│   ┌─ Card ─────────┐  ┌─ Card ─────────┐    │
│   │ Category  ›     │  │ Category  ›     │    │
│   │ Card Title      │  │ Card Title      │    │
│   └─────────────────┘  └─────────────────┘    │
│                                              │
├──────────────────────────────────────────────┤
│ CTA Section                                  │
│ "Plan the present. Build the future."        │
│ [Download]  [Open app]                       │
├──────────────────────────────────────────────┤
│ Footer (5-column grid)                       │
│ Product | Features | Company | Resources | Connect
└──────────────────────────────────────────────┘
```

---

## 7. Transition & Animation

Linear uses extremely subtle, fast transitions:

```css
/* Standard transition for interactive elements */
transition: background 0.15s ease;
transition: color 0.15s ease;
transition: border-color 0.2s ease;

/* Toggle switches */
transition: transform 0.2s ease, background 0.2s ease;
```

- No spring/bounce animations on standard UI
- No opacity transitions on hover (just color/background changes)
- Sidebar items use 0.1s for snappy feel
- Cards use 0.2s for border-color on hover

---

## 8. Iconography Guidelines

- **Style**: Outlined, thin stroke (1.5px), 16–20px viewbox
- **Color**: Icons inherit text color. Default is `--text-tertiary` (#8a8f98)
- **Active**: Icons in active sidebar items use `--text-primary` (#f7f8f8)
- **Status dots**: Solid filled circles (8px diameter) with the relevant status color
- **Recommended library**: Lucide Icons or a similar thin-line icon set. Avoid filled/solid icon styles.

---

## 9. Dark Mode Only

Linear's interface is dark-only. If your application needs a light mode, here are suggested light-mode token overrides based on Linear's own CSS variables:

```css
[data-theme="light"] {
  --bg-page:       #ffffff;
  --bg-sidebar:    #f5f5f5;
  --bg-base:       #fcfcfd;
  --bg-card:       #ffffff;
  --bg-elevated:   #f0f0f2;
  --bg-input:      #f5f5f5;
  --bg-hover:      #ebebed;
  --bg-active:     #e6e6e8;

  --border-default:  #e0e0e0;
  --border-subtle:   rgba(0, 0, 0, 0.06);
  --border-input:    #d0d0d0;
  --border-strong:   #c8c8c8;

  --text-primary:    #23252a;
  --text-secondary:  #3d4047;
  --text-tertiary:   #6b6f76;
  --text-muted:      #b0b5c0;
  --text-disabled:   #c8cbd0;
  --text-inverse:    #ffffff;

  --btn-primary-bg:    #08090a;
  --btn-primary-text:  #f7f8f8;
  --btn-secondary-bg:  #e8e8ea;
  --btn-secondary-text:#23252a;
}
```

---

## 10. Quick Reference — Common Patterns

### When building a new page:
1. Set `body { background: var(--bg-page); color: var(--text-primary); }`
2. Use `var(--bg-base)` for the main content area
3. Use `var(--bg-card)` for any card/panel surfaces
4. All text defaults to `var(--text-secondary)` except headings
5. Section gaps should be 40–64px
6. Card grids use 16px gaps

### When building a form:
1. Inputs: 30px height, 8px radius, 0.5px borders
2. Labels: 13px, weight 500, `--text-primary`
3. Help text: 12px, weight 450, `--text-muted`
4. Group related settings in a `.settings-group` card
5. Use `--accent-primary` for focus borders only

### When building a data table/list:
1. Row height: ~36px with 8px 12px padding
2. Borders between rows: 1px `--border-default`
3. Group headers: `--bg-elevated` background, 13px weight 500
4. Hover: `--bg-hover` background
5. Identifiers (IDs): `--text-muted` color
6. Right-aligned metadata: 12px, `--text-muted`

### When building navigation:
1. Navbar: sticky, 73px height, blur(20px), semi-transparent bg
2. Sidebar: 244px fixed width, `--bg-sidebar`
3. Active items: `--bg-active` with `--text-primary`
4. Section labels in sidebar: 12px, weight 500, `--text-muted`
