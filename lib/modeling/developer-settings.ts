import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export type ModelingVisibility = 'public' | 'coming-soon' | 'hidden'

export type ModelingDeveloperSettings = {
  courseStates: Record<string, ModelingVisibility>
}

export const MODELING_DEVELOPER_STATE_KEY = 'modeling-developer-center-v1'
export const MODELING_FEEDBACK_STATE_KEY = 'modeling-feedback-v1'

export function isModelingDeveloper(user: Pick<User, 'email' | 'user_metadata'> | null | undefined) {
  if (!user) return false
  const email = user.email?.toLowerCase() ?? ''
  const localPart = email.split('@')[0]
  const metadata = user.user_metadata ?? {}
  const handles = [
    metadata.user_name,
    metadata.preferred_username,
    metadata.username,
    metadata.login,
  ].filter((value): value is string => typeof value === 'string').map((value) => value.toLowerCase())

  return localPart === 'pj2479' || email.includes('jiangpf2022') || handles.includes('jiangpf2022')
}

export function normalizeModelingSettings(value: unknown): ModelingDeveloperSettings {
  const raw = value && typeof value === 'object' && 'courseStates' in value
    ? (value as { courseStates?: unknown }).courseStates
    : null
  const states: Record<string, ModelingVisibility> = {}
  if (raw && typeof raw === 'object') {
    for (const [key, state] of Object.entries(raw)) {
      if (/^\d+$/.test(key) && (state === 'public' || state === 'coming-soon' || state === 'hidden')) {
        states[key] = state
      }
    }
  }
  return { courseStates: states }
}

export async function getModelingDeveloperSettings() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_ui_state')
    .select('value')
    .eq('key', MODELING_DEVELOPER_STATE_KEY)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return normalizeModelingSettings(data?.value)
}

export function modelingVisibility(
  sequence: number,
  databaseStatus: string,
  settings: ModelingDeveloperSettings,
): ModelingVisibility {
  return settings.courseStates[String(sequence)] ?? (databaseStatus === 'published' ? 'public' : 'hidden')
}
