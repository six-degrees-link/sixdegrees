import type { PersonaType, FeatureCategory } from '@/lib/validators/requirements'

export const PERSONAS: {
  value: PersonaType
  label: string
  description: string
}[] = [
  {
    value: 'general_user',
    label: 'Connected Professional',
    description: 'Maintaining your network',
  },
  {
    value: 'job_seeker',
    label: 'Job Seeker',
    description: 'Actively looking for opportunities',
  },
  {
    value: 'employer',
    label: 'Employer',
    description: 'Posting jobs and reviewing candidates',
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    description: 'Sourcing and placing talent',
  },
  {
    value: 'content_creator',
    label: 'Content Creator',
    description: 'Sharing expertise via micro-sites',
  },
  {
    value: 'content_moderator',
    label: 'Content Moderator',
    description: 'Keeping the platform trustworthy',
  },
  {
    value: 'company',
    label: 'Company',
    description: 'Company presence and team pages',
  },
  {
    value: 'service_provider',
    label: 'Service Provider',
    description: 'Offering professional services',
  },
  {
    value: 'coach',
    label: 'Coach',
    description: 'Career or leadership coaching',
  },
  {
    value: 'educator',
    label: 'Educator',
    description: 'Training programs and certifications',
  },
  {
    value: 'platform_admin',
    label: 'Platform Admin',
    description: 'Managing the platform itself',
  },
]

export const CATEGORIES: { value: FeatureCategory; label: string }[] = [
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'admin', label: 'Admin' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'billing', label: 'Billing' },
  { value: 'content', label: 'Content' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'microsites', label: 'Micro-sites' },
  { value: 'moderation', label: 'Moderation' },
  { value: 'networking', label: 'Networking' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'profile', label: 'Profile' },
  { value: 'search', label: 'Search' },
  { value: 'verification', label: 'Verification' },
  { value: 'other', label: 'Other' },
]
