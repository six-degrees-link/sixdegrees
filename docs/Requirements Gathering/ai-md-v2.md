# SixDegrees - Claude AI Integration

## Overview

Claude AI is used to transform plain-language feature requests into structured, well-formed
user stories with acceptance criteria. This is the core differentiator of the requirements
gathering tool.

## Technical Setup

### Dependencies
```bash
npm install @anthropic-ai/sdk
```

### Configuration
- Model: `claude-sonnet-4-20250514` (cost-efficient, fast)
- Temperature: 0.3 (low for consistency)
- Max tokens: 2000
- Timeout: 30 seconds
- Daily cost cap: configurable via `CLAUDE_DAILY_COST_CAP_USD` env var (default $10)

### Client Setup

```typescript
// lib/claude/client.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

## System Prompt

```typescript
// lib/claude/prompts.ts

export const REFINEMENT_SYSTEM_PROMPT = `You are a senior product manager helping to gather requirements for SixDegrees, a new open-source professional networking platform built to replace LinkedIn.

## About SixDegrees

SixDegrees is:
- Free and open source
- Every user is identity-verified (no bots, no fake profiles)
- No AI-generated engagement bait ("AI slop")
- No surveillance economy or ad-driven feed manipulation
- Content creators get professional micro-sites they own
- No premium tier, no pay-to-play visibility

## Your Task

Transform a plain-language feature request into a structured user story with full requirement details. The contributor has selected a persona type and optionally a feature category.

## Persona Types

- general_user: Connected professional maintaining their network
- job_seeker: Actively looking for new opportunities
- employer: Posting jobs and reviewing candidates
- recruiter: Sourcing and placing talent (with accountability)
- content_moderator: Keeping the platform clean and trustworthy
- content_creator: Sharing expertise via owned micro-sites
- company: Managing company presence, listings, team pages
- service_provider: Offering professional services with verified reviews
- coach: Career/executive/leadership coaching
- educator: Training programs, certifications, skill-building
- platform_admin: Managing the platform itself

## Feature Categories

profile, messaging, search, jobs, content, networking, verification, admin, billing, notifications, analytics, microsites, moderation, other

## Output Format

Respond with ONLY a JSON object (no markdown fences, no preamble) with this structure:

{
  "refined_title": "Short, clear title (max 100 chars)",
  "user_story": "As a [persona], I want [feature], so that [benefit]",
  "refined_description": "2-3 paragraphs expanding on the user story with context about why this matters for SixDegrees specifically",
  "acceptance_criteria": ["Specific, testable criterion 1", "Criterion 2", ...],
  "persona_type": "confirmed or corrected persona type",
  "category": "best matching category from the list above",
  "priority_suggestion": "High/Medium/Low - with brief reasoning tied to SixDegrees values",
  "tags": ["relevant", "searchable", "tags"],
  "clarifications_needed": null or ["Question 1?", "Question 2?"],
  "similar_existing_titles": []
}

## Rules

1. The user story MUST follow "As a [persona], I want [feature], so that [benefit]" format
2. Generate 3-7 acceptance criteria. Each must be specific and testable (not vague like "works well")
3. Priority should reference SixDegrees values: verification, anti-ghosting, no surveillance, open source, user ownership
4. If the input is too vague to write good acceptance criteria, set clarifications_needed with 1-3 specific questions
5. If the input doesn't match the selected persona, suggest the correct one but still process it
6. Tags should be lowercase, no spaces, hyphenated if multi-word
7. Keep refined_description focused on WHY this matters for a LinkedIn replacement specifically
8. Do not repeat the user story verbatim in the description
9. Acceptance criteria should cover happy path, edge cases, and at least one accessibility or privacy consideration where relevant`;

export const REFINEMENT_USER_PROMPT = (
  rawInput: string,
  personaType: string,
  category?: string,
  existingRequirements?: Array<{ id: string; refined_title: string }>
) => {
  let prompt = `## Contributor's Input

Persona type: ${personaType}
${category ? `Category: ${category}` : 'Category: not specified (please suggest one)'}

Feature request:
"${rawInput}"`;

  if (existingRequirements && existingRequirements.length > 0) {
    prompt += `\n\n## Existing Requirements for ${personaType}

Check if this is similar to any of these already-submitted requirements. If so, include their titles in similar_existing_titles.

${existingRequirements.map(r => `- ${r.refined_title}`).join('\n')}`;
  }

  return prompt;
};
```

## Refinement Endpoint Implementation

```typescript
// app/api/refine/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { anthropic } from '@/lib/claude/client';
import { REFINEMENT_SYSTEM_PROMPT, REFINEMENT_USER_PROMPT } from '@/lib/claude/prompts';
import { RefineRequestSchema } from '@/lib/validators/requirements';
import { parseRefinementResponse } from '@/lib/claude/parse';

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // 2. Validate input
  const body = await req.json();
  const parsed = RefineRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { raw_input, persona_type, category } = parsed.data;

  // 3. Check daily cost cap
  const { data: dailyCost } = await supabase.rpc('get_daily_ai_cost');
  const cap = parseFloat(process.env.CLAUDE_DAILY_COST_CAP_USD || '10');

  if (dailyCost >= cap) {
    return NextResponse.json(
      {
        error: 'AI refinement has reached its daily limit. You can still submit requirements manually without AI refinement.',
        code: 'AI_UNAVAILABLE'
      },
      { status: 503 }
    );
  }

  // 4. Fetch existing requirements for duplicate detection
  const { data: existing } = await supabase
    .from('requirements')
    .select('id, refined_title')
    .eq('persona_type', persona_type)
    .in('status', ['submitted', 'approved', 'in_review'])
    .not('refined_title', 'is', null)
    .order('upvotes', { ascending: false })
    .limit(20);

  // 5. Call Claude
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      system: REFINEMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: REFINEMENT_USER_PROMPT(
            raw_input,
            persona_type,
            category,
            existing || []
          ),
        },
      ],
    });

    // 6. Extract text and parse
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    const refinement = parseRefinementResponse(responseText);

    // 7. Log usage
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const costUsd = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;

    await supabase.from('ai_usage_log').insert({
      contributor_id: session.user.id,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model: 'claude-sonnet-4-20250514',
      cost_usd: costUsd,
    });

    // 8. Return result
    const similarExisting = refinement.similar_existing_titles
      ? (existing || []).filter(r =>
          refinement.similar_existing_titles.includes(r.refined_title)
        ).map(r => ({ id: r.id, refined_title: r.refined_title }))
      : [];

    return NextResponse.json({
      data: { ...refinement, similar_existing: similarExisting },
    });
  } catch (error: any) {
    if (error.status === 408 || error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'AI refinement timed out. Please try again.', code: 'AI_UNAVAILABLE' },
        { status: 504 }
      );
    }
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'AI refinement failed. You can submit without refinement.', code: 'AI_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
```

## Response Parsing

```typescript
// lib/claude/parse.ts

export interface RefinementResult {
  refined_title: string;
  user_story: string;
  refined_description: string;
  acceptance_criteria: string[];
  persona_type: string;
  category: string;
  priority_suggestion: string;
  tags: string[];
  clarifications_needed: string[] | null;
  similar_existing_titles: string[];
}

export function parseRefinementResponse(text: string): RefinementResult {
  const cleaned = text
    .replace(/^```json?\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (!parsed.refined_title || !parsed.user_story) {
      throw new Error('Missing required fields');
    }

    return {
      refined_title: String(parsed.refined_title).slice(0, 200),
      user_story: String(parsed.user_story).slice(0, 1000),
      refined_description: String(parsed.refined_description || '').slice(0, 5000),
      acceptance_criteria: Array.isArray(parsed.acceptance_criteria)
        ? parsed.acceptance_criteria.map(String).slice(0, 10)
        : [],
      persona_type: String(parsed.persona_type || ''),
      category: String(parsed.category || 'other'),
      priority_suggestion: String(parsed.priority_suggestion || '').slice(0, 500),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map(String).slice(0, 10)
        : [],
      clarifications_needed: parsed.clarifications_needed
        ? parsed.clarifications_needed.map(String).slice(0, 3)
        : null,
      similar_existing_titles: Array.isArray(parsed.similar_existing_titles)
        ? parsed.similar_existing_titles.map(String)
        : [],
    };
  } catch (parseError) {
    console.error('Failed to parse Claude response:', cleaned);
    throw new Error('AI returned an invalid response');
  }
}
```

## Duplicate Detection

Two layers:

### Layer 1: PostgreSQL Trigram Similarity (pre-AI)

Before calling Claude, query for similar requirements using `pg_trgm`:

```typescript
const { data: similar } = await supabase.rpc('find_similar_requirements', {
  search_title: raw_input.slice(0, 200),
  search_persona: persona_type,
  similarity_threshold: 0.3,
  max_results: 10,
});
```

### Layer 2: Claude Context (in-AI)

Pass the top 20 existing requirement titles for the same persona into the Claude prompt.
Claude will flag matches in its `similar_existing_titles` response field.

## Cost Management

### Estimated Costs (claude-sonnet-4-20250514)
- Average input: ~800 tokens ($0.0024)
- Average output: ~600 tokens ($0.009)
- Average per refinement: ~$0.011
- At $10/day cap: ~900 refinements per day

### Monitoring
- Every API call logs tokens and cost to `ai_usage_log`
- Daily cost checked before each call via `get_daily_ai_cost()` RPC
- Admin dashboard shows cumulative cost and usage trends

### Fallback
When AI is unavailable (cost cap, API down, timeout):
- Frontend shows "Submit without AI refinement" option
- Requirement saved with only `raw_input` and `persona_type`
- Status set to "draft" (can be refined later when AI is available)
