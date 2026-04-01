import type { User } from '@supabase/supabase-js'

export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(user.email.toLowerCase())
}
