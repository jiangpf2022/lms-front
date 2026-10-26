import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export const MODELING_USER_ACCESS_KEY = 'modeling-user-access-v1'

export type ModelingAccessLevel = 0 | 1 | 2 | 3

export type ModelingUserAccess = {
  level: ModelingAccessLevel
  storedLevel: ModelingAccessLevel
  expiresAt: string | null
  expired: boolean
}

export function normalizeModelingUserAccess(value: unknown): ModelingUserAccess {
  if (!value || typeof value !== 'object' || !('level' in value)) {
    return { level: 0, storedLevel: 0, expiresAt: null, expired: false }
  }

  const raw = value as { level?: unknown; expiresAt?: unknown }
  const numericLevel = Number(raw.level)
  const storedLevel: ModelingAccessLevel = numericLevel === 1 || numericLevel === 2 || numericLevel === 3
    ? numericLevel
    : 0
  const parsedExpiry = typeof raw.expiresAt === 'string' ? new Date(raw.expiresAt) : null
  const expiresAt = parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) ? parsedExpiry.toISOString() : null
  const expired = Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now())

  return {
    storedLevel,
    level: expired ? 0 : storedLevel,
    expiresAt,
    expired,
  }
}

export async function getModelingUserAccess(userId: string | null | undefined): Promise<ModelingUserAccess> {
  if (!userId) return normalizeModelingUserAccess(null)

  const admin = createAdminClient()
  const { data } = await admin
    .from('user_ui_state')
    .select('value')
    .eq('user_id', userId)
    .eq('key', MODELING_USER_ACCESS_KEY)
    .maybeSingle()

  return normalizeModelingUserAccess(data?.value)
}

export function canAccessModelingLesson({
  developer,
  accessLevel,
  lessonLevel,
  lessonSequence,
}: {
  developer: boolean
  accessLevel: ModelingAccessLevel
  lessonLevel: 1 | 2 | 3
  lessonSequence: number
}) {
  if (developer) return true
  if (lessonLevel === 1 && lessonSequence === 1) return true
  return accessLevel >= lessonLevel
}
