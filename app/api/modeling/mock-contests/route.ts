import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isModelingDeveloper } from '@/lib/modeling/developer-settings'
import {
  MODELING_MOCK_CONTESTS_KEY,
  mockContestPhase,
  normalizeMockContest,
  normalizeMockContests,
  type MockContest,
} from '@/lib/modeling/mock-contests'

async function session() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user, developer: isModelingDeveloper(user) }
}

async function readContests(userId?: string) {
  const admin = createAdminClient()
  let ownerIds = userId ? [userId] : []
  if (!userId) {
    for (let page = 1; page <= 10; page += 1) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 })
      ownerIds.push(...data.users.filter((account) => isModelingDeveloper(account)).map((account) => account.id))
      if (data.users.length < 200) break
    }
    ownerIds = [...new Set(ownerIds)]
  }
  if (ownerIds.length === 0) return []
  const query = admin
    .from('user_ui_state')
    .select('value')
    .eq('key', MODELING_MOCK_CONTESTS_KEY)
    .in('user_id', ownerIds)
    .order('updated_at', { ascending: false })
    .limit(1)
  const { data } = await query.maybeSingle()
  return normalizeMockContests(data?.value)
}

async function writeContests(userId: string, contests: MockContest[]) {
  const admin = createAdminClient()
  return admin.from('user_ui_state').upsert({
    user_id: userId,
    key: MODELING_MOCK_CONTESTS_KEY,
    value: { items: contests },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,key' })
}

export async function GET(request: Request) {
  const { user, developer } = await session()
  const requestedId = new URL(request.url).searchParams.get('id')
  const contests = await readContests(developer ? user?.id : undefined)
  const visible = contests
    .filter((contest) => developer || contest.visibility === 'listed')
    .filter((contest) => !requestedId || contest.id === requestedId)
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    .map((contest) => ({ ...contest, phase: mockContestPhase(contest) }))
  return NextResponse.json({ items: visible, developer, signedIn: Boolean(user) })
}

export async function POST(request: Request) {
  const { user, developer } = await session()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const now = new Date().toISOString()
  const contest = normalizeMockContest({ ...body, id: crypto.randomUUID(), createdAt: now, updatedAt: now })
  if (!contest || contest.problems.length < 1) {
    return NextResponse.json({ error: 'Valid bilingual titles, a valid time window, and at least one problem are required' }, { status: 400 })
  }
  const contests = await readContests(user.id)
  const { error } = await writeContests(user.id, [...contests, contest])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: { ...contest, phase: mockContestPhase(contest) } }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { user, developer } = await session()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const id = typeof body?.id === 'string' ? body.id : ''
  const contests = await readContests(user.id)
  const current = contests.find((contest) => contest.id === id)
  if (!current) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
  const next = normalizeMockContest({ ...current, ...body, id, createdAt: current.createdAt, updatedAt: new Date().toISOString() })
  if (!next || next.problems.length < 1) return NextResponse.json({ error: 'Invalid contest data' }, { status: 400 })
  const updated = contests.map((contest) => contest.id === id ? next : contest)
  const { error } = await writeContests(user.id, updated)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: { ...next, phase: mockContestPhase(next) } })
}

export async function DELETE(request: Request) {
  const { user, developer } = await session()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Contest id is required' }, { status: 400 })
  const contests = await readContests(user.id)
  const { error } = await writeContests(user.id, contests.filter((contest) => contest.id !== id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
