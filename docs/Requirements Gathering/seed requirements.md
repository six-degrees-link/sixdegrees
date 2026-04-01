# LinkedIn's most loved and most loathed features in 2025

LinkedIn dominates professional networking with **1.2 billion members** and **310 million monthly active users**, generating $17.8 billion in annual revenue — yet it carries a **1.6 out of 5 rating on Trustpilot** and a 670,000-member subreddit dedicated to mocking its culture. This paradox defines the platform: professionals depend on it because no viable alternative exists, not because they enjoy it. The data below maps both the features driving record engagement and the pain points fueling user resentment, organized with enough detail to derive structured user stories and acceptance criteria for each feature area.

---

## The features that keep 310 million users coming back

### Job search and recruiting: LinkedIn's gravitational core

Job search remains LinkedIn's most mission-critical feature. **65 million people search for jobs weekly**, submitting **8,200+ applications per minute** across **22 million active listings**. Seven people get hired every minute. On the employer side, **87% of recruiters** use LinkedIn regularly, and Talent Solutions generates an estimated **$7 billion+** annually — historically 65% of total revenue.

The Easy Apply feature drives enormous volume but creates a double-edged dynamic: applications rose **45.5% in Q3 2024** even as job postings fell **10.6%**, flooding recruiters with candidates. LinkedIn's AI job matching now redirects roughly **2 million applications monthly** toward better-fit roles, and a new natural-language job search lets users describe what they want conversationally rather than using keyword filters. Premium job seekers are marketed as "**2.6x more likely to get hired**," though over 70% of hires occur without Premium.

**Key personas**: Job seekers (primary), recruiters, HR teams, hiring managers.  
**User story detail**: Job seekers need intelligent matching that surfaces relevant roles and provides application status transparency. Recruiters need tools that filter signal from noise given massive application volumes. Acceptance criteria should address match quality scoring, application acknowledgment within defined timeframes, and ATS integration that doesn't silently discard résumés.

### Content feed engagement is at an all-time high

Despite complaints about content quality, LinkedIn's engagement metrics lead all major social platforms. The median engagement rate climbed from **6.0% in January 2024 to 8.01% in January 2025** — surpassing Instagram, Facebook, and X. The platform sees **1.5 million feed updates viewed per minute** and **443 billion feed updates viewed annually**. Only about **1% of monthly active users** (~3 million) post weekly, yet they generate **9 billion impressions**.

Content format performance reveals clear hierarchies: **carousels deliver 278% more engagement** than video, **native documents (PDFs) earn 1.9x more** engagement than standard posts, and **video watch time grew 36% year-over-year**. LinkedIn Live streams generate **24x more comments** and **7x more reactions** than pre-recorded video. Text-only posts still dominate for raw organic reach. The algorithm now heavily weights **dwell time** — how long users actually spend reading — over simple likes or reactions, and **comments are valued 15x more than likes**.

**Key personas**: Content creators, B2B marketers, executives (C-suite posts get **4x more engagement**), thought leaders.  
**User story detail**: Creators need transparent analytics showing what drives reach. Marketers need format-specific performance data. Acceptance criteria should cover real-time engagement metrics, content format recommendations, and clear algorithmic signals about what gets distributed.

### Messaging, InMail, and the AI acceleration

Messaging is central to LinkedIn's value across all user types. InMail delivers a **300% higher response rate than email** and is **4.6x more effective** than cold outreach for business communication. The AI revolution here is measurable: AI-assisted messages have a **44% higher acceptance rate** and are accepted **11% faster**. LinkedIn's AI Hiring Assistant drives a **69% higher InMail response rate** for recruiters.

Sales Navigator users see **30% higher InMail response rates** than standard LinkedIn messaging, with **50 InMail credits per month** on the Core plan. The platform processes connections at a staggering rate: **17,000 new connections every minute**, with the average user maintaining roughly **1,300 connections**.

**Key personas**: Recruiters, sales professionals, business development, all networkers.  
**User story detail**: Users need spam-free inboxes with intelligent filtering. Sales professionals need integration with CRM workflows. Acceptance criteria should address message deliverability, response tracking, and clear differentiation between genuine outreach and automated spam.

### Premium subscriptions and LinkedIn Learning are surging

Premium passed a major milestone: **$2 billion in annual subscription revenue** (confirmed January 2025 by CEO Ryan Roslansky), with **175 million Premium subscribers** — a **50% increase** between 2023 and 2025. Sign-ups jumped **51% in fiscal year 2024**, driven primarily by AI-powered features. Roughly **40% of Premium users actively use AI tools** like profile writing assistance, interview prep, and career path analysis.

LinkedIn Learning serves **27 million users** across **24,000+ courses** in **36 languages**, with **78% of Fortune 100 companies** using it. Course enrollments grew **35%** in 2024, and the platform releases roughly 50 new courses weekly. Companies using Learning see **20% higher internal mobility**, and professionals who use it are **51% more likely to hit sales quotas**.

**Key personas**: Job seekers (Premium Career), sales teams (Sales Navigator), recruiters (Recruiter Lite), L&D departments (Learning).  
**User story detail**: Users need clear ROI justification for each Premium tier. Learners need personalized skill-gap analysis and career-relevant course recommendations. Acceptance criteria should include measurable outcomes (interview rates, hire rates, skill certifications) tied to subscription features.

### Newsletters and company pages round out the ecosystem

Newsletters are LinkedIn's fastest-growing content format: **184,000+ newsletters** now exist (up from 36,000 in early 2024), with **500 million+ total subscriptions** across **28 million subscribing members**. Company newsletters average **~40% open rates**, and LinkedIn sends triple notifications (email, push, in-app) for each edition. Notably, **98% of the top 100 newsletters** are authored by individuals, not companies.

Company pages number **57 million+**, with **40% of users engaging** with business pages weekly. However, personal profiles dramatically outperform company pages — earning **2.75x more impressions** and **5x more engagement**. For B2B marketers, this matters enormously: **97% use LinkedIn** for content distribution, and **80% of B2B social leads** originate on the platform.

**Key personas**: Thought leaders, B2B marketers, employer branding teams, company page admins.  
**User story detail**: Newsletter creators need subscriber growth tools and sponsorship capabilities. Company page admins need competitive benchmarking and employee advocacy features. Acceptance criteria should cover subscriber analytics (email open rates, click-through), content scheduling, and audience segmentation.

---

## The features users love to hate

### The algorithmic black box and declining organic reach

The single most pervasive complaint is LinkedIn's opaque, constantly shifting algorithm. An August 2025 overhaul introduced LLM-based content ranking (confirmed by VP of Engineering Tim Jurka), causing widespread confusion and engagement drops. Users report feeds showing **2-3 week old posts** instead of fresh content, with the "not interested" button having minimal lasting effect.

A major controversy erupted in November 2025: the **#WearThePants experiment**, where women changed their profile gender to male and saw impressions jump **200–818%**. One founder reported a **238% increase**. LinkedIn denied using demographic data for ranking but acknowledged investigating the reports. TechCrunch, Fortune, and Social Media Today all covered the story. Cornell researcher Sarah Dean noted that "someone's demographics can affect both sides of the algorithm."

For content creators, the practical impact is severe. Organic reach has declined significantly, especially for accounts that previously commanded large audiences. The algorithm now favors dwell time over engagement metrics, penalizes engagement pods, and extends content lifespan to weeks — meaning high-performing posts from strangers crowd out fresh content from connections.

**Most affected personas**: Content creators, women users, professionals relying on organic reach for business development, small business owners who can't afford paid promotion.  
**User story detail**: Users need algorithmic transparency and control over their feed composition. Acceptance criteria should include chronological feed options, granular content-type filtering, clear explanations of why content appears, and verifiable fairness across demographic groups.

### AI-generated content is drowning the platform

According to Originality.ai, **over half of long-form LinkedIn posts are now likely AI-generated**. Research by Richard van der Blom found AI content gets **30% less reach and 55% less engagement** — but the sheer volume overwhelms feeds regardless. The term "AI slop" entered mainstream vocabulary in 2025, and LinkedIn became what one analysis called "ground zero" for it: professional content is easy to fake, the platform rewards volume, and nobody fact-checks.

The contradiction is glaring: LinkedIn updated its User Agreement in November 2024 to **disclaim responsibility for AI-generated content errors** while simultaneously selling AI writing tools to Premium subscribers. The platform's enhanced spam detection claims **94% accuracy** in identifying automated content, but users report the problem persists and is worsening. AI bots now scrape profiles and generate personalized spam messages that are increasingly difficult to distinguish from genuine outreach.

**Most affected personas**: All feed consumers, content creators competing for attention, recruiters parsing genuine vs. fabricated credentials.  
**User story detail**: Users need content provenance indicators and effective AI-content filtering. Acceptance criteria should include AI-generation labeling, user-controlled AI content visibility settings, and verified human-authored content badges.

### Recruiter ghosting and the application black hole

The 2025 Ghosting Index reports that **75% of job applications receive zero response**. A separate survey found **61% of job seekers have been ghosted after interviews** — up 9 percentage points from early 2024. ATS systems filter out up to **75% of résumés** before any human review.

Easy Apply compounds the problem by enabling mass applications that overwhelm recruiters — some positions receive thousands of applications in days. A hidden settings issue makes it worse: if users don't check "Share with job poster" when applying, recruiters may never see the application, and most job seekers don't know this. LinkedIn's business model creates perverse incentives: the platform profits from application volume through premium recruiter tools, paid listings, and job-seeker subscriptions.

**Most affected personas**: Job seekers (especially entry-to-mid-level), career changers, laid-off professionals.  
**User story detail**: Job seekers need application status transparency and guaranteed acknowledgment. Acceptance criteria should include mandatory employer response timelines, application status tracking with defined stages, and clear disclosure of whether applications were viewed by a human.

### Fake profiles, bots, and the trust crisis

LinkedIn removed **200 million bot accounts in 2024** — representing 16.7% of its total user base. In the first half of 2025, another **83.7 million** were culled. Bot activity has **nearly quadrupled in six years**. The platform's invalid traffic rate sits at **19.8%**, meaning nearly **$2,000 of every $10,000 in ad spend** is wasted on non-human impressions.

The consequences extend beyond annoyance. FTC data shows job scam losses jumped from **$90 million in 2020 to $501 million in 2024**. NordLayer research found **52% of U.S. businesses** have fallen victim to LinkedIn scams. Fake recruiters specifically target #OpenToWork users within minutes of posting. In 2025, a massive database exposure revealed billions of LinkedIn-derived records including detailed profiles, contact information, and employment histories.

**Most affected personas**: Job seekers (scam targets), advertisers (wasted spend), all users (trust erosion), enterprises (data exposure risk).  
**User story detail**: Users need robust identity verification and scam protection. Acceptance criteria should include real-time scam detection alerts, verified employer badges for job postings, advertiser refunds for bot-delivered impressions, and proactive notification when profile data appears in breaches.

### Premium paywalls and the free-user squeeze

LinkedIn's Premium strategy increasingly restricts free-tier functionality. Free users now receive only **3–5 personalized connection request messages per month** (down from unlimited), limited search results, and restricted profile view history. Premium Career costs **$29.99–$39.99/month**, Sales Navigator Core runs **$119.99/month**, and Recruiter Lite starts at **$170/month**.

Reddit sentiment is overwhelmingly negative: over **80% of users who tried Premium** report it wasn't worth it, and **85% of job seekers land jobs with free accounts**. Trustpilot and ConsumerAffairs are filled with billing complaints — unauthorized charges, difficulty canceling, and trial conversions without clear notice. InMail response rates for cold outreach average **under 10%**, undermining one of Premium's flagship selling points.

**Most affected personas**: Job seekers evaluating Premium, small business owners, sales professionals assessing Sales Navigator ROI, budget-conscious professionals.  
**User story detail**: Users need transparent value demonstration before and during subscriptions. Acceptance criteria should include clear ROI metrics per tier, easy one-click cancellation, proactive trial-ending notifications, and granular feature unbundling so users can pay only for what they need.

### Spam, cringe culture, and the engagement-bait epidemic

Connection request spam from salespeople is a universal complaint: users report **10+ unopened spam messages** at any given time, with AI-generated pitches now indistinguishable from each other. Browser extensions that auto-connect and auto-message remain widely available, creating an ecosystem of automated outreach that degrades the platform for everyone.

The cultural dimension is equally toxic. The subreddit r/LinkedInLunatics (**670,000+ members**) documents what Bloomberg called content that is "too personal, political, and cringe" — humble brags, hustle porn, performative vulnerability, and people turning personal tragedies into business lessons. Research shows **more than one-third of LinkedIn users fabricate profile details**, and nearly half report **feelings of negativity** from the platform's comparison-driven culture. Unlike other social media, LinkedIn comparisons "cut deeper because they tap into core values: accountability, work ethic, creativity."

**Most affected personas**: All users (spam recipients), professionals experiencing comparison anxiety, genuine content creators competing with engagement bait.  
**User story detail**: Users need effective spam filtering and authentic content surfacing. Acceptance criteria should include automated spam detection with user-adjustable sensitivity, engagement-bait content flagging, connection request filtering by intent category, and mental health–conscious feed design options.

---

## What the data reveals about building for LinkedIn's users

The feature landscape divides into four distinct user segments, each with sharply different needs and frustrations:

- **Job seekers** (65 million weekly) need application transparency, scam protection, and ATS visibility — not more AI tools that increase application volume without improving outcomes
- **Recruiters and sales professionals** (87% of recruiters, 700K+ Sales Navigator users) need signal-to-noise tools that cut through the automation-driven spam their own industry creates
- **Content creators** (~3 million weekly posters generating 9 billion impressions) need algorithmic transparency, AI-content differentiation, and sustainable organic reach that doesn't require Premium
- **Passive networkers** (the silent majority of 310 million MAUs) need a cleaner feed, less notification noise, and protection from the spam and scam ecosystem

The overarching tension is structural: LinkedIn's revenue model profits from the very behaviors users hate most. Application volume drives recruiter tool sales. Spam drives Premium adoption for filtering tools. Declining organic reach drives advertising purchases. AI tools simultaneously create the content pollution and sell the solution. Any product strategy built on LinkedIn user stories must reckon with this fundamental misalignment between platform incentives and user needs.

## Conclusion

LinkedIn's position in 2025–2026 is one of uncontested dominance paired with deepening user dissatisfaction. Engagement metrics are at record highs (**8% median engagement rate**, **$2B+ Premium revenue**, **175M subscribers**), but so are the markers of platform decay: **200M+ bots removed annually**, **75% of applications ghosted**, **half of long-form content likely AI-generated**, and a privacy record that includes a **€310 million GDPR fine**. The most actionable insight for product teams: the highest-value user stories aren't about adding features — they're about fixing the trust deficit. Verified identities (**55M already verified**), application transparency, algorithmic fairness, and spam eradication represent the gap between what LinkedIn sells (professional opportunity) and what users actually experience (a platform they tolerate because they must).