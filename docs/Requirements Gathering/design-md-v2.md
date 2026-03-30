# SixDegrees - Design System (Linear-Inspired)

## Philosophy

- Dark-first, depth through background color stepping (no box-shadows)
- Compact and information-dense (30px control height, 13px UI text)
- Monochromatic with surgical accent (#828fff on interactive elements only)
- Inter Variable font, weight 510 as signature weight
- No gradients, no glows, no rounded-everything
- Borders: thin (0.5-1px), corners: modest (4-16px), transitions: fast (150ms)

## CSS Custom Properties

Add to `app/globals.css`:

```css
:root {
  /* Backgrounds */
  --bg-page:       #08090a;
  --bg-sidebar:    #090909;
  --bg-base:       #0f0f11;
  --bg-card:       #0f1011;
  --bg-elevated:   #161718;
  --bg-input:      #1a1b1e;
  --bg-hover:      #1c1e21;
  --bg-active:     #1e2023;
  --bg-overlay:    rgba(0, 0, 0, 0.6);

  /* Borders */
  --border-default:  #1c1e21;
  --border-subtle:   rgba(255, 255, 255, 0.08);
  --border-input:    #2a2d32;
  --border-strong:   #23252a;

  /* Text */
  --text-primary:    #f7f8f8;
  --text-secondary:  #d0d6e0;
  --text-tertiary:   #8a8f98;
  --text-muted:      #6b6f76;
  --text-disabled:   #4a4d54;
  --text-inverse:    #08090a;

  /* Accent */
  --accent-primary:  #828fff;
  --accent-hover:    #9ba3ff;

  /* Status */
  --status-green:    #4ade80;
  --status-yellow:   #fbbf24;
  --status-orange:   #f97316;
  --status-red:      #ef4444;
  --status-blue:     #5e6ad2;
  --status-purple:   #8b5cf6;

  /* Buttons */
  --btn-primary-bg:    #e6e6e6;
  --btn-primary-text:  #08090a;
  --btn-secondary-bg:  #2d2e31;
  --btn-secondary-text:#e4e5e9;
  --btn-ghost-text:    #8a8f98;

  /* Typography */
  --font-sans: 'Inter Variable', 'Inter', -apple-system, system-ui, sans-serif;

  /* Radius */
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
}

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

## Typography Scale

| Name | Size | Weight | Letter-Spacing | Line-Height | Usage |
|------|------|--------|---------------|-------------|-------|
| Hero | 64px | 510 | -1.408px | 1.06 | Landing hero heading |
| Page Title | 48px | 510 | -1.056px | 1.1 | Page titles |
| Section Headline | 40px | 510 | -0.88px | 1.15 | CTA taglines |
| Card Heading | 24px | 590 | -0.288px | 1.2 | Requirement titles |
| Body | 17px | 400 | normal | 1.6 | Long-form text |
| Section Header | 15px | 600 | normal | 1.4 | Section titles |
| UI Label | 13px | 510 | -0.13px | 1.5 | Buttons, labels, nav |
| Description | 12px | 450 | normal | 1.4 | Helper text, metadata |
| Micro | 11px | 400 | normal | 1.3 | Timestamps |

**Rules**:
- All headings 24px+ MUST have negative letter-spacing
- Body text color: --text-secondary (not --text-primary)
- Placeholder text: --text-muted
- Inline links: --text-primary weight 510 (no underline)
- CTA links: --accent-primary weight 510

## Component Specs (Tailwind Classes)

### Button

```tsx
// Sizes
const sizes = {
  sm: 'h-7 px-2.5 text-[13px] rounded',        // 28px
  md: 'h-8 px-3.5 text-[13px] rounded-md',      // 32px
  lg: 'h-9 px-[18px] text-[13px] rounded-lg',   // 36px
};

// Variants
const variants = {
  primary: 'bg-[#e6e6e6] text-[#08090a] border border-[#e6e6e6] hover:bg-white font-[510]',
  secondary: 'bg-[#2d2e31] text-[#e4e5e9] border border-[#2a2d32] hover:bg-[#3a3b3f] font-[510]',
  ghost: 'bg-transparent text-[#8a8f98] hover:text-[#d0d6e0] hover:bg-[#1c1e21] font-[510]',
  danger: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.25)] font-[510]',
};
// All buttons: transition-colors duration-150 cursor-pointer
```

### Input

```tsx
// h-[30px] px-2.5 py-1.5 text-[13px] rounded-lg
// bg-[#1a1b1e] border-[0.5px] border-[#2a2d32]
// text-[#d0d6e0] placeholder:text-[#6b6f76]
// focus:border-[#828fff] focus:outline-none
// transition-colors duration-150
```

### Card

```tsx
// Standard: bg-[#0f1011] rounded-2xl p-8 px-6
//           border border-[#1c1e21]
//           hover:border-[#23252a] transition-colors duration-200
// Compact:  p-4 rounded-xl
```

### Badge/Pill

```tsx
// Base: inline-flex items-center h-[22px] px-2
//       text-[12px] font-medium rounded-full gap-1

const personaBadgeColors = {
  general_user:      'bg-[rgba(130,143,255,0.12)] text-[#828fff]',
  job_seeker:        'bg-[rgba(74,222,128,0.12)] text-[#4ade80]',
  employer:          'bg-[rgba(251,191,36,0.12)] text-[#fbbf24]',
  recruiter:         'bg-[rgba(249,115,22,0.12)] text-[#f97316]',
  content_moderator: 'bg-[rgba(239,68,68,0.12)] text-[#ef4444]',
  content_creator:   'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
  company:           'bg-[rgba(94,106,210,0.15)] text-[#828fff]',
  service_provider:  'bg-[rgba(74,222,128,0.12)] text-[#4ade80]',
  coach:             'bg-[rgba(251,191,36,0.12)] text-[#fbbf24]',
  educator:          'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
  platform_admin:    'bg-[rgba(239,68,68,0.12)] text-[#ef4444]',
};

const statusBadgeColors = {
  draft:     'bg-[#161718] text-[#8a8f98]',
  submitted: 'bg-[rgba(94,106,210,0.15)] text-[#828fff]',
  in_review: 'bg-[rgba(251,191,36,0.12)] text-[#fbbf24]',
  approved:  'bg-[rgba(74,222,128,0.12)] text-[#4ade80]',
  rejected:  'bg-[rgba(239,68,68,0.12)] text-[#ef4444]',
  merged:    'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
};

const priorityBadgeColors = {
  High:   'bg-[rgba(239,68,68,0.12)] text-[#ef4444]',
  Medium: 'bg-[rgba(251,191,36,0.12)] text-[#fbbf24]',
  Low:    'bg-[rgba(94,106,210,0.15)] text-[#828fff]',
};
```

### List Item (Browse Page)

```tsx
// flex items-center px-3 py-2 gap-2.5
// border-b border-[#1c1e21]
// text-[13px] text-[#f7f8f8]
// hover:bg-[#1c1e21] transition-colors duration-100
// cursor-pointer
```

### Navbar

```tsx
// h-[73px] bg-[rgba(8,9,10,0.8)] backdrop-blur-[20px]
// border-b border-[rgba(255,255,255,0.08)]
// flex items-center justify-between px-6
// sticky top-0 z-50
```

### Toggle Switch

```tsx
// Track: w-9 h-5 rounded-full bg-[#1c1e21]
//        data-[active=true]:bg-[#828fff] transition-colors duration-200
// Thumb: w-4 h-4 rounded-full bg-[#8a8f98]
//        translate-x-0 data-[active=true]:translate-x-4
//        data-[active=true]:bg-white transition-transform duration-200
```

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Icon-to-text gaps |
| 2 | 8px | Related element gaps |
| 3 | 10px | Pill padding, sidebar item padding |
| 4 | 12px | Card grid gaps, button padding |
| 5 | 16px | Standard component spacing |
| 6 | 20px | Nav link spacing |
| 7 | 24px | Card internal padding |
| 8 | 32px | Card top/bottom padding |
| 9 | 40px | Between major sections |
| 10 | 48px | Page title to content |
| 11 | 64px | Major page sections |
| 12 | 80px | Hero sections |

## Transitions

No spring/bounce animations. No opacity transitions on hover.

```css
/* Standard interactive */  transition: background 0.15s ease;
/* Text color */            transition: color 0.15s ease;
/* Card borders */          transition: border-color 0.2s ease;
/* Toggles */               transition: transform 0.2s ease, background 0.2s ease;
/* Sidebar items (snappy)*/ transition: background 0.1s ease;
```

## Icons

- Library: Lucide Icons (thin outlined, 1.5px stroke)
- Default size: 16-20px
- Default color: --text-tertiary (#8a8f98)
- Active color: --text-primary (#f7f8f8)
- Status dots: 8px solid circles with status color

## Tailwind Config Extensions

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: { sans: ['var(--font-sans)'] },
    fontWeight: { book: '450', semi: '510', heading: '590' },
    colors: {
      page: '#08090a', base: '#0f0f11', card: '#0f1011',
      elevated: '#161718', 'input-bg': '#1a1b1e',
      hover: '#1c1e21', active: '#1e2023',
      accent: '#828fff', 'accent-hover': '#9ba3ff',
    },
    letterSpacing: {
      hero: '-1.408px', title: '-1.056px',
      section: '-0.88px', card: '-0.288px', label: '-0.13px',
    },
  },
},
```
