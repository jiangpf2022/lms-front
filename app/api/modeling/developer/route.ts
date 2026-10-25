import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isModelingDeveloper,
  MODELING_DEVELOPER_STATE_KEY,
  normalizeModelingSettings,
} from '@/lib/modeling/developer-settings'

async function developerSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user, allowed: isModelingDeveloper(user) }
}

export async function GET() {
  const { supabase, user, allowed } = await developerSession()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const { data, error } = await supabase
    .from('user_ui_state')
    .select('value')
    .eq('user_id', user.id)
    .eq('key', MODELING_DEVELOPER_STATE_KEY)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(normalizeModelingSettings(data?.value))
}

export async function PUT(request: Request) {
  const { supabase, user, allowed } = await developerSession()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!allowed) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
  const settings = normalizeModelingSettings(await request.json())
  const { error } = await supabase.from('user_ui_state').upsert({
    user_id: user.id,
    key: MODELING_DEVELOPER_STATE_KEY,
    value: settings,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(settings)
}
