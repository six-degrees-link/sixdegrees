# SixDegrees - User Personas

## Overview

SixDegrees serves 11 distinct user persona types. Each persona has specific goals, workflows,
and feature needs. Requirements are gathered and tagged per persona to ensure complete coverage.

This file defines each persona and provides the guiding prompts displayed on the submission
form when a contributor selects that persona type.

## Implementation

```typescript
// lib/constants/personas.ts

export interface PersonaDefinition {
  type: string;
  label: string;
  icon: string;           // Lucide icon name
  description: string;
  goals: string[];
  workflows: string[];
  guidingPrompts: string[];
}

export const PERSONAS: PersonaDefinition[] = [
  // ... definitions below
];
```

---

## 1. General User (Connected Professional)

**Type**: `general_user` | **Icon**: `User`

**Description**: A professional who uses SixDegrees to maintain their professional identity, connect with peers, and stay visible in their industry. Not actively job hunting, not recruiting - just networking and being present.

**Goals**: Maintain a credible, verified professional identity. Connect with colleagues and industry contacts. Consume and share relevant professional content. Control their own data and visibility.

**Key Workflows**: Create and maintain a professional profile. Connect with colleagues, peers, and industry contacts. Share and consume professional content. Discover people and companies in their field. Manage privacy and visibility settings.

**Guiding Prompts**:
- "What should a professional profile look like on SixDegrees?"
- "How should connections and networking work differently from LinkedIn?"
- "What kind of content feed would you actually want to read?"
- "How should identity verification work for regular users?"
- "What privacy controls matter most to you?"

---

## 2. Job Seeker

**Type**: `job_seeker` | **Icon**: `Search`

**Description**: A professional actively looking for new opportunities. Needs to showcase skills, find relevant openings, apply efficiently, and track their job search - without being ghosted into oblivion.

**Goals**: Find relevant job opportunities quickly. Present verified credentials to stand out. Track applications and get timely responses. Never be ghosted by an employer.

**Key Workflows**: Build a compelling profile optimized for job search. Search and filter job listings. Apply to positions with verified credentials. Track application status and follow-ups. Get matched with relevant opportunities.

**Guiding Prompts**:
- "What's broken about job searching on LinkedIn that SixDegrees should fix?"
- "How should job applications and tracking work?"
- "What information about a company would help you decide to apply?"
- "How should verified credentials help in the job search?"
- "What would a 'no ghosting' commitment look like from employers?"

---

## 3. Employer

**Type**: `employer` | **Icon**: `Building2`

**Description**: A hiring manager or company representative who posts jobs, reviews candidates, and manages the employer brand. Needs efficient tools to find verified talent without wading through fake profiles.

**Goals**: Find qualified, verified candidates efficiently. Build an authentic employer brand. Manage the hiring pipeline transparently. Honor response commitments to candidates.

**Key Workflows**: Post and manage job listings. Review applications and verified candidate profiles. Build employer brand page. Communicate with candidates (no ghosting policy). Track hiring pipeline metrics.

**Guiding Prompts**:
- "What would make hiring on SixDegrees better than LinkedIn?"
- "How should employer branding work on an open platform?"
- "What candidate verification would you trust?"
- "How should the anti-ghosting policy work for employers?"
- "What hiring analytics would be most useful?"

---

## 4. Recruiter

**Type**: `recruiter` | **Icon**: `Users`

**Description**: Agency or in-house recruiter who sources candidates, manages talent pipelines, and connects job seekers with employers. On SixDegrees, recruiters operate transparently with verified identities and accountability.

**Goals**: Source verified candidates efficiently. Build a trustworthy reputation through transparency. Manage talent pipelines at scale. Be held accountable for response times.

**Guiding Prompts**:
- "How should recruiter accountability work on SixDegrees?"
- "What sourcing tools would make you more effective?"
- "How should recruiter reputation and ratings work?"
- "What transparency should exist between recruiters and candidates?"

---

## 5. Content Moderator

**Type**: `content_moderator` | **Icon**: `Shield`

**Description**: Community volunteers or platform staff responsible for ensuring content quality, enforcing community guidelines, and keeping SixDegrees free of spam, bots, and AI slop.

**Goals**: Keep the platform free of spam and bot content. Detect and flag AI-generated slop. Handle reports and appeals fairly. Maintain community trust.

**Guiding Prompts**:
- "What moderation tools would help keep SixDegrees clean?"
- "How should AI-generated content be detected and handled?"
- "What should the content appeals process look like?"
- "How should moderator workload be managed fairly?"

---

## 6. Content Creator

**Type**: `content_creator` | **Icon**: `PenTool`

**Description**: Professionals who share expertise through articles, videos, podcasts, and other content. On SixDegrees, they get professional micro-sites they own - no algorithm choking their reach, no pay-to-play visibility.

**Goals**: Own their professional content platform. Reach audiences organically without paying. Build a genuine following based on quality. Optionally monetize their expertise.

**Guiding Prompts**:
- "What kind of micro-site would you want for your professional brand?"
- "How should content distribution work without an algorithm tax?"
- "What analytics would help you create better content?"
- "How should SixDegrees prevent AI-generated slop in content?"
- "What monetization options would be valuable?"

---

## 7. Company

**Type**: `company` | **Icon**: `Building`

**Description**: Organizations that maintain a presence on SixDegrees with verified company profiles, job listings, and team pages. Their micro-site is their professional home on the platform.

**Goals**: Present an authentic, verified company identity. Attract talent with transparent culture showcasing. Manage team presence and company updates. Build trust through verified reviews.

**Guiding Prompts**:
- "What should a company micro-site include beyond what LinkedIn offers?"
- "How should company verification and trust badges work?"
- "What tools should companies have to manage their team's presence?"
- "How should company reviews and ratings work transparently?"

---

## 8. Service Provider

**Type**: `service_provider` | **Icon**: `Wrench`

**Description**: Freelancers, consultants, agencies, and professional service firms who use SixDegrees to market their services, find clients, and build credibility through verified work history and client reviews.

**Goals**: Showcase services and build credibility. Find clients through the platform. Collect verified, trustworthy reviews. Manage client relationships professionally.

**Guiding Prompts**:
- "What would make a great service provider micro-site?"
- "How should client reviews and ratings work with verification?"
- "What discovery tools would help clients find the right service provider?"
- "How should SixDegrees handle service provider credentialing?"
- "What features would help manage client relationships?"

---

## 9. Coach

**Type**: `coach` | **Icon**: `Compass`

**Description**: Career coaches, executive coaches, leadership coaches, and mentors who offer professional development services. They need tools to find clients, demonstrate their impact, and manage their practice.

**Goals**: Build a visible coaching practice. Connect with professionals seeking coaching. Demonstrate outcomes and collect testimonials. Manage scheduling and client relationships.

**Guiding Prompts**:
- "What tools do coaches need to find and serve clients?"
- "How should coaching credentials be verified on SixDegrees?"
- "What scheduling and session management features matter?"
- "How should coaching outcomes and testimonials be presented?"

---

## 10. Educator

**Type**: `educator` | **Icon**: `GraduationCap`

**Description**: Training companies, bootcamps, universities, course creators, and individual educators who offer professional development, certifications, and skill-building programs.

**Goals**: Reach professionals seeking to upskill. Verify educational credentials and accreditation. Track student outcomes and career progression. Build reputation through verified results.

**Guiding Prompts**:
- "How should educational credentials and certifications be verified?"
- "What tools do educators need to reach professionals seeking skills?"
- "How should SixDegrees display learning pathways and career progression?"
- "What makes a great training provider listing?"

---

## 11. Platform Administrator

**Type**: `platform_admin` | **Icon**: `Settings`

**Description**: The team running SixDegrees itself. Manages platform operations, user support, system health, and community governance. Since SixDegrees is open source, admin tools must be transparent and auditable.

**Goals**: Keep the platform running smoothly. Support users and resolve disputes. Maintain platform integrity and trust. Operate transparently (open source values).

**Guiding Prompts**:
- "What admin tools are essential for running an open-source platform?"
- "How should user verification be managed at scale?"
- "What platform health metrics matter most?"
- "How should admin actions be transparent and auditable?"

---

## Feature Categories

Requirements are also tagged with a feature category to enable cross-persona analysis.

```typescript
// lib/constants/categories.ts

export const FEATURE_CATEGORIES = [
  { value: 'profile',       label: 'Profile',       icon: 'User' },
  { value: 'messaging',     label: 'Messaging',     icon: 'MessageSquare' },
  { value: 'search',        label: 'Search',        icon: 'Search' },
  { value: 'jobs',          label: 'Jobs',           icon: 'Briefcase' },
  { value: 'content',       label: 'Content',        icon: 'FileText' },
  { value: 'networking',    label: 'Networking',     icon: 'Users' },
  { value: 'verification',  label: 'Verification',  icon: 'ShieldCheck' },
  { value: 'admin',         label: 'Admin',          icon: 'Settings' },
  { value: 'billing',       label: 'Billing',        icon: 'CreditCard' },
  { value: 'notifications', label: 'Notifications', icon: 'Bell' },
  { value: 'analytics',     label: 'Analytics',      icon: 'BarChart3' },
  { value: 'microsites',    label: 'Microsites',    icon: 'Globe' },
  { value: 'moderation',    label: 'Moderation',    icon: 'Shield' },
  { value: 'other',         label: 'Other',          icon: 'MoreHorizontal' },
];
```
