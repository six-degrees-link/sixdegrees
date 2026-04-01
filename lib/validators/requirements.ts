import { z } from 'zod'

export const PersonaTypeSchema = z.enum([
  'general_user',
  'job_seeker',
  'employer',
  'recruiter',
  'content_moderator',
  'content_creator',
  'company',
  'service_provider',
  'coach',
  'educator',
  'platform_admin',
])

export const FeatureCategorySchema = z.enum([
  'profile',
  'messaging',
  'search',
  'jobs',
  'content',
  'networking',
  'verification',
  'admin',
  'billing',
  'notifications',
  'analytics',
  'microsites',
  'moderation',
  'accessibility',
  'other',
])

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
})

export const UpdateRequirementSchema = CreateRequirementSchema.partial()

export const RefineRequestSchema = z.object({
  raw_input: z.string().min(10).max(5000),
  persona_type: PersonaTypeSchema,
  category: FeatureCategorySchema.optional(),
})

export const VoteSchema = z.object({
  vote_type: z.enum(['up', 'down']),
})

export const CommentSchema = z.object({
  body: z.string().min(1).max(2000),
})

export const RequirementsQuerySchema = z.object({
  persona_type: PersonaTypeSchema.optional(),
  category: FeatureCategorySchema.optional(),
  status: z
    .enum(['draft', 'submitted', 'in_review', 'approved', 'rejected', 'merged'])
    .optional(),
  sort: z.enum(['votes', 'newest', 'oldest']).default('newest'),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PersonaType = z.infer<typeof PersonaTypeSchema>
export type FeatureCategory = z.infer<typeof FeatureCategorySchema>
export type CreateRequirementInput = z.infer<typeof CreateRequirementSchema>
export type RequirementsQuery = z.infer<typeof RequirementsQuerySchema>
