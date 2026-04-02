# SixDegrees Requirements Platform — User Guide

This platform is where the SixDegrees community decides what gets built. You submit feature requests, Claude AI refines them into structured specs, and the community votes and discusses. The requirements with the most support get prioritized.

No account tiers. No algorithm. Your vote counts the same as everyone else's.

---

## Table of Contents

- [Signing in](#signing-in)
- [Submitting a requirement](#submitting-a-requirement)
- [How AI refinement works](#how-ai-refinement-works)
- [Browsing requirements](#browsing-requirements)
- [Voting](#voting)
- [Comments](#comments)
- [Dashboard](#dashboard)
- [Leaderboard](#leaderboard)
- [Flagging content](#flagging-content)
- [Subscriptions](#subscriptions)

---

## Signing in

Go to `/signin` and enter your email address. You'll receive a magic link — click it and you're in. No password. No OAuth dance. No "sign in with LinkedIn."

The link expires after a few minutes. If it doesn't arrive, check spam or request a new one.

Your account is created automatically the first time you sign in. There's nothing to fill out — you start contributing immediately.

---

## Submitting a requirement

Go to `/submit`. The form has three steps.

### Step 1: Describe the feature

Write what you want in plain language. Don't worry about format or structure. Describe the problem you're trying to solve or the thing you want to be able to do.

Examples of good plain-language input:

> "I want to be able to see which of my connections works in a specific industry without having to click through each profile one by one."

> "Job listings should show the actual salary range, not 'competitive compensation.' If you won't say the number, you're wasting my time."

Be specific. Vague requests get vague results.

### Step 2: AI refinement

After you submit your description, Claude AI rewrites it into a structured user story. This step:

- Identifies who the feature is for (the persona)
- Writes a formal user story: *As a [persona], I want to [goal], so that [outcome]*
- Breaks down acceptance criteria — specific, testable conditions that define "done"
- Suggests a category and tags
- Flags potential duplicates if similar requirements already exist

**You can edit the refined version** before submitting. If the AI misunderstood your intent, fix it. You're not locked into what it generated.

If the AI is unavailable (rate limit or cost cap hit), your submission goes in as a draft with your original text. You can come back and run refinement later.

**Rate limit**: 10 AI refinements per hour per account.

### Step 3: Review and submit

Check the final requirement. If it looks right, submit it. Your requirement enters the moderation queue with status `submitted`.

A moderator will review it and either approve it, reject it, or mark it as a duplicate of an existing requirement.

---

## How AI refinement works

Claude is given your raw description along with the top 20 existing requirements on the platform. It uses that context to:

1. Understand whether your request is genuinely new or overlaps with something already submitted
2. Map your request to one of the 11 user personas
3. Assign a feature category
4. Write the structured user story and acceptance criteria

The AI does not make moderation decisions. It surfaces potential duplicates but a human moderator makes the final call on what gets approved, merged, or rejected.

### User personas

The platform uses 11 personas to organize requirements by who they serve:

| Persona | What it covers |
|---------|---------------|
| Connected Professional | General platform users — networking, feed, connections |
| Job Seeker | Job search, applications, career tools |
| Employer | Hiring, job posting, company presence |
| Recruiter | Candidate sourcing, outreach, pipeline management |
| Content Creator | Publishing, microsites, content tools |
| Educator | Teaching, credentials, educational programs |
| Coach | Coaching services, client relationships |
| Service Provider | Freelancers and service businesses |
| Company | Brand pages, company-level features |
| Content Moderator | Platform safety and moderation tools |
| Platform Admin | Admin controls and infrastructure |

### Feature categories

Requirements are grouped into these categories:

`accessibility` · `admin` · `analytics` · `billing` · `content` · `jobs` · `messaging` · `microsites` · `moderation` · `networking` · `notifications` · `profile` · `search` · `verification` · `other`

---

## Browsing requirements

Go to `/browse` to see all approved requirements.

You can filter by:
- **Status**: submitted, in review, approved, rejected, merged
- **Category**: any of the 15 feature categories
- **Persona**: any of the 11 user personas
- **Search**: full-text search across titles and descriptions

Filters update the URL so you can bookmark or share a specific view.

Results are paginated. The URL tracks the current page, so browser back/forward works correctly.

---

## Voting

On any approved requirement, you can upvote or downvote. Click once to vote, click again to remove your vote. You can switch from upvote to downvote at any time.

Vote counts are displayed on requirement cards in the browse view and on the full requirement page. They're sorted into the leaderboard.

You need to be signed in to vote.

---

## Comments

Open a requirement at `/requirements/[id]` to see the full detail and comment thread.

**Posting comments**: Sign in, scroll to the comment section, type your comment, and submit. There's no character limit, but keep it relevant.

**Editing and deleting**: You can edit or delete your own comments. There's a short window after posting where edits appear without an "edited" marker — after that, edited comments are marked as such.

**Threading**: Comments are flat (no nested replies). If you're responding to a specific comment, quote the relevant part or mention the commenter by context.

**Flagging**: If a comment violates community standards, flag it. See [Flagging content](#flagging-content).

---

## Dashboard

Go to `/dashboard` to see a breakdown of submitted requirements by persona and category.

The bar charts show coverage across all 11 personas and 15 categories. This is useful for identifying gaps — areas where the community hasn't submitted many requirements yet.

---

## Leaderboard

Go to `/leaderboard` to see the top contributors ranked by:
- Number of requirements submitted
- Total upvotes received across their requirements

This is not a reputation system. There are no badges, levels, or premium tiers. It's a simple public record of contribution.

---

## Flagging content

If you see a requirement or comment that's spam, off-topic, abusive, or otherwise inappropriate, flag it.

**To flag a requirement**: Click the flag icon on the requirement detail page.

**To flag a comment**: Click the flag icon next to the comment.

Flags are reviewed by moderators. You won't receive a notification about the outcome — moderation happens in the background. Don't use flags to express disagreement with a requirement. That's what downvotes are for.

---

## Subscriptions

You can subscribe to receive notifications when new requirements are submitted for a specific persona type. This is useful if you only care about, say, job-seeker features or content creator features.

Manage your subscriptions from your account. Unsubscribe at any time.

---

## Requirement statuses explained

| Status | Meaning |
|--------|---------|
| `draft` | Submitted without AI refinement (AI was unavailable). Awaiting moderation. |
| `submitted` | In the moderation queue. Not yet publicly visible in browse. |
| `in_review` | A moderator is actively reviewing it. |
| `approved` | Accepted into the public requirements list. Open for voting. |
| `rejected` | Did not meet standards or was out of scope. Not visible in browse by default. |
| `merged` | Duplicate of an existing requirement. Consolidated into the target requirement. |

---

## Questions or problems

Open an issue on GitHub: https://github.com/six-degrees-link/sixdegrees/issues
