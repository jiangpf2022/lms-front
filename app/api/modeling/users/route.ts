import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isModelingDeveloper } from '@/lib/modeling/developer-settings'
import { MODELING_USER_ACCESS_KEY, normalizeModelingUserAccess } from '@/lib/modeling/user-access'

const LEARNING_KEY = 'modeling-learning-center-v1'

async function requireDeveloper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { user, developer: isModelingDeveloper(user) }
}

export async function GET() {
  const { user, developer } = await requireDeveloper()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const admin = createAdminClient()
  const accounts = []
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    accounts.push(...data.users)
    if (data.users.length < 200) break
  }
  const ids = accounts.map((account) => account.id)
  const [{ data: accessRows, error: accessError }, { data: learningRows, error: learningError }] = await Promise.all([
    ids.length ? admin.from('user_ui_state').select('user_id,value,updated_at').eq('key', MODELING_USER_ACCESS_KEY).in('user_id', ids) : Promise.resolve({ data: [], error: null }),
    ids.length ? admin.from('user_ui_state').select('user_id,value,updated_at').eq('key', LEARNING_KEY).in('user_id', ids) : Promise.resolve({ data: [], error: null }),
  ])
  if (accessError || learningError) return NextResponse.json({ error: accessError?.message ?? learningError?.message }, { status: 500 })
  const accessByUser = new Map((accessRows ?? []).map((row) => [row.user_id, { ...normalizeModelingUserAccess(row.value), updatedAt: row.updated_at }]))
  const learningByUser = new Map((learningRows ?? []).map((row) => [row.user_id, { value: row.value, updatedAt: row.updated_at }]))
  return NextResponse.json({
    items: accounts.map((account) => ({
      id: account.id,
      email: account.email ?? '',
      name: account.user_metadata?.full_name ?? account.user_metadata?.name ?? account.user_metadata?.user_name ?? account.email?.split('@')[0] ?? 'User',
      avatarUrl: account.user_metadata?.avatar_url ?? account.user_metadata?.picture ?? '',
      createdAt: account.created_at,
      lastSignInAt: account.last_sign_in_at ?? null,
      accessLevel: accessByUser.get(account.id)?.level ?? 0,
      storedAccessLevel: accessByUser.get(account.id)?.storedLevel ?? 0,
      accessExpiresAt: accessByUser.get(account.id)?.expiresAt ?? null,
      accessExpired: accessByUser.get(account.id)?.expired ?? false,
      accessUpdatedAt: accessByUser.get(account.id)?.updatedAt ?? null,
      learningState: learningByUser.get(account.id)?.value ?? { progress: {}, bookmarks: [], practiceHistory: [] },
      learningUpdatedAt: learningByUser.get(account.id)?.updatedAt ?? null,
    })),
  })
}

export async function PATCH(request: Request) {
  const { user, developer } = await requireDeveloper()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const body = await request.json().catch(() => null) as { userId?: unknown; level?: unknown; expiresAt?: unknown } | null
  const userId = typeof body?.userId === 'string' ? body.userId : ''
  const level = Number(body?.level)
  if (!userId || ![0, 1, 2, 3].includes(level)) return NextResponse.json({ error: 'A valid user and access level are required' }, { status: 400 })
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const defaultExpiry = new Date()
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 6)
  const requestedExpiry = typeof body?.expiresAt === 'string' ? new Date(body.expiresAt) : defaultExpiry
  const expiresAt = Number.isNaN(requestedExpiry.getTime()) ? defaultExpiry.toISOString() : requestedExpiry.toISOString()
  const expired = new Date(expiresAt) <= new Date()
  const effectiveLevel = expired ? 0 : level
  const { error } = await admin.from('user_ui_state').upsert({
    user_id: userId,
    key: MODELING_USER_ACCESS_KEY,
    value: { level: effectiveLevel, expiresAt, updatedAt: now, updatedBy: user.id },
    updated_at: now,
  }, { onConflict: 'user_id,key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ userId, level: effectiveLevel, storedLevel: effectiveLevel, expiresAt, expired, updatedAt: now })
}
