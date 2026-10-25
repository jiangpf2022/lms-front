import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isModelingDeveloper, MODELING_FEEDBACK_STATE_KEY } from '@/lib/modeling/developer-settings'

type FeedbackStatus = 'pending' | 'adopted' | 'reviewed'
type ModelingFeedback = {
  id: string
  lessonId: number
  lessonTitle: string
  chapterId: string
  chapterTitle: string
  message: string
  status: FeedbackStatus
  createdAt: string
  updatedAt: string
}

function parseFeedback(value: unknown): ModelingFeedback[] {
  if (!value || typeof value !== 'object' || !('items' in value)) return []
  const items = (value as { items?: unknown }).items
  if (!Array.isArray(items)) return []
  return items.filter((item): item is ModelingFeedback => Boolean(
    item && typeof item === 'object' &&
    typeof (item as ModelingFeedback).id === 'string' &&
    typeof (item as ModelingFeedback).message === 'string'
  ))
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await request.json() as Partial<ModelingFeedback>
  const message = body.message?.trim().slice(0, 4000)
  if (!message || !Number.isInteger(body.lessonId) || !body.chapterId) {
    return NextResponse.json({ error: 'Lesson, chapter, and suggestion are required' }, { status: 400 })
  }
  const { data } = await supabase.from('user_ui_state').select('value').eq('user_id', user.id).eq('key', MODELING_FEEDBACK_STATE_KEY).maybeSingle()
  const now = new Date().toISOString()
  const item: ModelingFeedback = {
    id: crypto.randomUUID(),
    lessonId: Number(body.lessonId),
    lessonTitle: String(body.lessonTitle ?? '').slice(0, 300),
    chapterId: String(body.chapterId).slice(0, 120),
    chapterTitle: String(body.chapterTitle ?? '').slice(0, 300),
    message,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  const items = [item, ...parseFeedback(data?.value)].slice(0, 200)
  const { error } = await supabase.from('user_ui_state').upsert({
    user_id: user.id,
    key: MODELING_FEEDBACK_STATE_KEY,
    value: { items },
    updated_at: now,
  }, { onConflict: 'user_id,key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const admin = createAdminClient()
  if (!isModelingDeveloper(user)) {
    const { data } = await supabase.from('user_ui_state').select('value').eq('user_id', user.id).eq('key', MODELING_FEEDBACK_STATE_KEY).maybeSingle()
    return NextResponse.json({ items: parseFeedback(data?.value) })
  }
  const { data: rows, error } = await admin.from('user_ui_state').select('user_id,value,updated_at').eq('key', MODELING_FEEDBACK_STATE_KEY)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ids = [...new Set((rows ?? []).map((row) => row.user_id))]
  const identities = new Map<string, { email?: string; name?: string }>()
  for (let page = 1; page <= 5; page += 1) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    for (const account of data.users) {
      if (ids.includes(account.id)) identities.set(account.id, { email: account.email, name: account.user_metadata?.full_name ?? account.user_metadata?.user_name })
    }
    if (data.users.length < 200) break
  }
  return NextResponse.json({
    items: (rows ?? []).flatMap((row) => parseFeedback(row.value).map((item) => ({ ...item, userId: row.user_id, user: identities.get(row.user_id) ?? {} }))),
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!isModelingDeveloper(user)) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const body = await request.json() as { userId?: string; feedbackId?: string; status?: FeedbackStatus }
  if (!body.userId || !body.feedbackId || !['pending', 'adopted', 'reviewed'].includes(body.status ?? '')) {
    return NextResponse.json({ error: 'Invalid feedback update' }, { status: 400 })
  }
  const admin = createAdminClient()
  const { data } = await admin.from('user_ui_state').select('value').eq('user_id', body.userId).eq('key', MODELING_FEEDBACK_STATE_KEY).maybeSingle()
  const now = new Date().toISOString()
  const items = parseFeedback(data?.value).map((item) => item.id === body.feedbackId ? { ...item, status: body.status as FeedbackStatus, updatedAt: now } : item)
  const { error } = await admin.from('user_ui_state').upsert({ user_id: body.userId, key: MODELING_FEEDBACK_STATE_KEY, value: { items }, updated_at: now }, { onConflict: 'user_id,key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items })
}
