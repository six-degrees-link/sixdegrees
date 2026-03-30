# SixDegrees - API Specification

## Overview

All API routes are Next.js App Router API routes (`app/api/`).
Authentication is via Supabase Auth (magic links). Auth tokens are passed as cookies.
All responses follow a consistent format.

## Response Format

### Success
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

### Error
```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE"
}
```

### Error Codes
| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized for this action |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| RATE_LIMITED | 429 | Too many requests |
| AI_UNAVAILABLE | 503 | Claude API unavailable or cost cap reached |
| INTERNAL_ERROR | 500 | Server error |

## Zod Schemas

```typescript
// lib/validators/requirements.ts
import { z } from 'zod';

export const PersonaTypeSchema = z.enum([
  'general_user', 'job_seeker', 'employer', 'recruiter',
  'content_moderator', 'content_creator', 'company',
  'service_provider', 'coach', 'educator', 'platform_admin'
]);

export const FeatureCategorySchema = z.enum([
  'profile', 'messaging', 'search', 'jobs', 'content',
  'networking', 'verification', 'admin', 'billing',
  'notifications', 'analytics', 'microsites', 'moderation', 'other'
]);

export const CreateRequirementSchema = z.object({
  raw_input: z.string().min(10).max(5000),
  persona_type: PersonaTypeSchema,
  category: FeatureCategorySchema.optional(),
  refined_title: z.string().max(200).optional(),
  user_story: z.string().max(1000).optional(),
  refined_description: z.string().max(5000).optional(),
  acceptance_criteria: z.array(z.string()).max(10).optional(),
  priority_suggestion: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const UpdateRequirementSchema = CreateRequirementSchema.partial();

export const RefineRequestSchema = z.object({
  raw_input: z.string().min(10).max(5000),
  persona_type: PersonaTypeSchema,
  category: FeatureCategorySchema.optional(),
});

export const VoteSchema = z.object({
  vote_type: z.enum(['up', 'down']),
});

export const CommentSchema = z.object({
  body: z.string().min(1).max(2000),
});

export const RequirementsQuerySchema = z.object({
  persona_type: PersonaTypeSchema.optional(),
  category: FeatureCategorySchema.optional(),
  status: z.enum(['draft', 'submitted', 'in_review', 'approved', 'rejected', 'merged']).optional(),
  sort: z.enum(['votes', 'newest', 'oldest']).default('newest'),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

---

## Endpoints

### POST /api/requirements

Create a new requirement.

- **Auth**: Required
- **Body** (CreateRequirementSchema): `raw_input`, `persona_type`, and optionally all refined fields
- **Response** (201): Created requirement with id, status, persona_type, created_at
- **Notes**: Status is "draft" if no refined fields, "submitted" if refined fields present. contributor_id set from auth session.

---

### GET /api/requirements

List requirements with filtering and pagination.

- **Auth**: Not required
- **Query Parameters**: persona_type, category, status, sort (votes|newest|oldest), search, page, limit
- **Response** (200): Array of requirements with contributor info, vote counts, comment counts, and pagination meta
- **Notes**: When `search` is provided, use PostgreSQL full-text search on `search_vector`. When `sort=votes`, order by `(upvotes - downvotes) DESC`. Exclude `merged` and `rejected` from default listing unless status filter explicitly set.

---

### GET /api/requirements/[id]

Get a single requirement with full details.

- **Auth**: Not required
- **Response** (200): Full requirement object including user_vote (null, "up", or "down" for authenticated users)

---

### PATCH /api/requirements/[id]

Update a requirement (owner only, draft/submitted status only).

- **Auth**: Required (must be owner)
- **Body** (UpdateRequirementSchema): Any subset of requirement fields
- **Response** (200): Updated requirement object

---

### GET /api/requirements/stats

Dashboard statistics.

- **Auth**: Not required
- **Response** (200): total_requirements, total_contributors, total_votes, by_persona counts, by_category counts, by_status counts, top_voted list, recent_activity feed

---

### POST /api/requirements/[id]/vote

Vote on a requirement.

- **Auth**: Required
- **Body**: `{ "vote_type": "up" | "down" }`
- **Response** (200): vote_type, upvotes, downvotes
- **Notes**: Upserts - if user already voted, changes their vote. Vote counts updated via database trigger.

---

### DELETE /api/requirements/[id]/vote

Remove a vote.

- **Auth**: Required
- **Response** (200): Updated upvotes, downvotes counts

---

### GET /api/requirements/[id]/comments

List comments for a requirement.

- **Auth**: Not required
- **Query**: page, limit
- **Response** (200): Array of comments with contributor info, pagination meta

---

### POST /api/requirements/[id]/comments

Add a comment.

- **Auth**: Required
- **Body**: `{ "body": "Comment text..." }`
- **Response** (201): Created comment object

---

### POST /api/refine

Refine a plain-language requirement using Claude AI.

- **Auth**: Required
- **Body**: `{ "raw_input": "...", "persona_type": "...", "category?": "..." }`
- **Response** (200): Refined requirement with title, user_story, description, acceptance_criteria, priority_suggestion, tags, similar_existing, clarifications_needed
- **Error cases**: Daily cost cap (503 AI_UNAVAILABLE), timeout (504), invalid response (retry once then partial)
- **Rate limiting**: Max 10 refinements per user per hour

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/refine | 10 | per hour per user |
| POST /api/requirements/[id]/vote | 100 | per hour per user |
| POST /api/requirements/[id]/comments | 20 | per hour per user |
| POST /api/requirements | 30 | per hour per user |

## Authentication Flow

1. Client calls Supabase `signInWithOtp({ email })`
2. Supabase sends magic link to email
3. User clicks link, redirected to `/auth/callback`
4. Callback route exchanges code for session
5. Session cookie set automatically by Supabase client
6. All subsequent API requests include session cookie
7. Server-side: `createRouteHandlerClient({ cookies })` to get auth user
