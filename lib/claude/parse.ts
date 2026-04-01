export interface RefinementResult {
  refined_title: string
  user_story: string
  refined_description: string
  acceptance_criteria: string[]
  persona_type: string
  category: string
  priority_suggestion: string
  tags: string[]
  clarifications_needed: string[] | null
  similar_existing_titles: string[]
}

export function parseRefinementResponse(text: string): RefinementResult {
  // Strip markdown code fences if Claude wrapped the JSON
  const cleaned = text
    .replace(/^```json?\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  if (!parsed.refined_title || !parsed.user_story) {
    throw new Error('Missing required fields in Claude response')
  }

  return {
    refined_title: String(parsed.refined_title).slice(0, 200),
    user_story: String(parsed.user_story).slice(0, 1000),
    refined_description: String(parsed.refined_description ?? '').slice(0, 5000),
    acceptance_criteria: Array.isArray(parsed.acceptance_criteria)
      ? parsed.acceptance_criteria.map(String).slice(0, 10)
      : [],
    persona_type: String(parsed.persona_type ?? ''),
    category: String(parsed.category ?? 'other'),
    priority_suggestion: String(parsed.priority_suggestion ?? '').slice(0, 500),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 10) : [],
    clarifications_needed: Array.isArray(parsed.clarifications_needed)
      ? parsed.clarifications_needed.map(String).slice(0, 3)
      : null,
    similar_existing_titles: Array.isArray(parsed.similar_existing_titles)
      ? parsed.similar_existing_titles.map(String)
      : [],
  }
}
