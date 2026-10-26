'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Search, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Lesson = { id: number; sequence: number; title: string; titleZh: string; totalUnits?: number }
type Progress = { completed?: string[]; scores?: Record<string, number>; xp?: number; lastStudiedAt?: string }
type PracticeAttempt = { lessonNumber?: number; score?: number; questionCount?: number; completedAt?: string }
type LearningState = { progress?: Record<string, Progress>; practiceHistory?: PracticeAttempt[]; bookmarks?: unknown[] }
type UserRow = {
  id: string
  email: string
  name: string
  avatarUrl: string
  createdAt: string
  lastSignInAt: string | null
  accessLevel: 0 | 1 | 2 | 3
  storedAccessLevel: 0 | 1 | 2 | 3
  accessExpiresAt: string | null
  accessExpired: boolean
  learningState: LearningState
  learningUpdatedAt: string | null
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0
}

function sixMonthsFromNow() {
  const date = new Date()
  date.setMonth(date.getMonth() + 6)
  return date.toISOString()
}

function dateInputValue(value: string | null) {
  return (value ?? sixMonthsFromNow()).slice(0, 10)
}

export function ModelingUserAnalytics({ lessons, locale }: { lessons: Lesson[]; locale: string }) {
  const isChinese = locale.startsWith('zh')
  const t = (en: string, zh: string) => isChinese ? zh : en
  const [users, setUsers] = useState<UserRow[]>([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch('/api/modeling/users', { cache: 'no-store' })
    const value = await response.json().catch(() => ({ items: [] })) as { items?: UserRow[] }
    setUsers(value.items ?? [])
    setLoading(false)
  }, [])
  useEffect(() => { queueMicrotask(() => { void load() }) }, [load])

  const rows = useMemo(() => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (b.lastSignInAt ?? b.createdAt).localeCompare(a.lastSignInAt ?? a.createdAt)), [query, users])

  function summary(user: UserRow) {
    const progress = Object.values(user.learningState.progress ?? {})
    const scores = progress.flatMap((entry) => Object.values(entry.scores ?? {})).filter(Number.isFinite)
    const completed = progress.reduce((sum, entry) => sum + (entry.completed?.length ?? 0), 0)
    const xp = progress.reduce((sum, entry) => sum + (entry.xp ?? 0), 0)
    return { activeLessons: progress.filter((entry) => (entry.completed?.length ?? 0) > 0).length, completed, averageQuiz: average(scores), xp }
  }

  async function setAccess(userId: string, level: 0 | 1 | 2 | 3, expiresAt: string) {
    setSavingId(userId)
    const response = await fetch('/api/modeling/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, level, expiresAt }) })
    if (response.ok) {
      const value = await response.json() as { level: 0 | 1 | 2 | 3; storedLevel: 0 | 1 | 2 | 3; expiresAt: string; expired: boolean }
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, accessLevel: value.level, storedAccessLevel: value.storedLevel, accessExpiresAt: value.expiresAt, accessExpired: value.expired } : user))
    }
    setSavingId('')
  }

  return <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4"><div><h3 className="font-black">{t('Registered users', '注册用户')}</h3><p className="mt-1 text-xs text-muted-foreground">{t('Access tiers and synced learning records only; passwords and authentication secrets are never exposed.', '仅显示课程权限与已同步的学习记录；密码和认证密钥永远不会显示。')}</p></div><label className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3"><Search className="h-3.5 w-3.5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Search users', '搜索用户')} className="w-40 bg-transparent text-xs outline-none" /></label></div>
    {loading ? <div className="p-12 text-center text-sm text-muted-foreground">{t('Loading user records…', '正在读取用户数据…')}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[1020px] text-sm"><thead className="bg-muted/40 text-left text-[10px] font-black uppercase tracking-[0.13em] text-muted-foreground"><tr><th className="px-4 py-3">{t('User', '用户')}</th><th className="px-4 py-3">{t('Access', '权限')}</th><th className="px-4 py-3">{t('Expires', '到期时间')}</th><th className="px-4 py-3">{t('Active courses', '已学习课程')}</th><th className="px-4 py-3">{t('Quiz average', '测验均分')}</th><th className="px-4 py-3">XP</th><th className="px-4 py-3">{t('Last sign-in', '最近登录')}</th><th className="px-4 py-3 text-right">{t('Details', '详情')}</th></tr></thead><tbody className="divide-y divide-border">{rows.map((user) => {
      const metrics = summary(user)
      const open = expanded === user.id
      return <UserRows key={user.id} user={user} metrics={metrics} open={open} lessons={lessons} locale={locale} saving={savingId === user.id} onAccess={setAccess} onToggle={() => setExpanded(open ? null : user.id)} />
    })}</tbody></table></div>}
    {!loading && rows.length === 0 && <div className="p-12 text-center"><Users className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">{t('No matching users.', '没有匹配的用户。')}</p></div>}
  </section>
}

function UserRows({ user, metrics, open, lessons, locale, saving, onAccess, onToggle }: { user: UserRow; metrics: { activeLessons: number; completed: number; averageQuiz: number; xp: number }; open: boolean; lessons: Lesson[]; locale: string; saving: boolean; onAccess: (id: string, level: 0 | 1 | 2 | 3, expiresAt: string) => void; onToggle: () => void }) {
  const isChinese = locale.startsWith('zh')
  const t = (en: string, zh: string) => isChinese ? zh : en
  const progress = user.learningState.progress ?? {}
  const practice = user.learningState.practiceHistory ?? []
  return <>
    <tr className="hover:bg-muted/20"><td className="px-4 py-3"><div className="flex items-center gap-3">{user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={32} height={32} unoptimized className="h-8 w-8 rounded-full object-cover" /> : <div className="grid h-8 w-8 place-items-center rounded-full bg-[#163f2c] text-xs font-black text-white">{user.name.slice(0, 1).toUpperCase()}</div>}<div><div className="font-bold">{user.name}</div><div className="text-[11px] text-muted-foreground">{user.email}</div></div></div></td><td className="px-4 py-3"><select aria-label={t(`Access level for ${user.name}`, `${user.name} 的权限级别`)} disabled={saving} value={user.storedAccessLevel} onChange={(event) => onAccess(user.id, Number(event.target.value) as 0 | 1 | 2 | 3, user.accessExpiresAt ?? sixMonthsFromNow())} className={cn('rounded-lg border px-2.5 py-1.5 text-xs font-black outline-none', user.accessLevel === 0 ? 'border-slate-300 bg-slate-100 text-slate-700' : user.accessLevel === 1 ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : user.accessLevel === 2 ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-rose-300 bg-rose-50 text-rose-800')}><option value={0}>Level 0</option><option value={1}>Level 1</option><option value={2}>Level 2</option><option value={3}>Level 3</option></select>{user.accessExpired && <span className="ml-2 rounded-full bg-rose-100 px-2 py-1 text-[9px] font-black text-rose-700">{t('EXPIRED → L0', '已到期 → L0')}</span>}</td><td className="px-4 py-3"><input type="date" disabled={saving} value={dateInputValue(user.accessExpiresAt)} onChange={(event) => onAccess(user.id, user.storedAccessLevel, new Date(`${event.target.value}T23:59:59`).toISOString())} className={cn('rounded-lg border bg-background px-2 py-1.5 text-xs outline-none', user.accessExpired && 'border-rose-300 text-rose-700')} /></td><td className="px-4 py-3 font-mono text-xs">{metrics.activeLessons} / {lessons.length}</td><td className="px-4 py-3 font-mono text-xs">{metrics.averageQuiz}%</td><td className="px-4 py-3 font-mono text-xs">{metrics.xp}</td><td className="px-4 py-3 text-xs text-muted-foreground">{user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString(isChinese ? 'zh-CN' : 'en-US') : '—'}</td><td className="px-4 py-3 text-right"><button onClick={onToggle} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-black">{open ? t('Close', '收起') : t('Analyze', '分析')}{open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</button></td></tr>
    {open && <tr><td colSpan={8} className="bg-[#f6f8f5] px-4 py-4 dark:bg-white/[0.025]"><div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{t('Account created', '注册时间')}: {new Date(user.createdAt).toLocaleString(isChinese ? 'zh-CN' : 'en-US')}</span><span>{t('Learning data synced', '学习数据同步')}: {user.learningUpdatedAt ? new Date(user.learningUpdatedAt).toLocaleString(isChinese ? 'zh-CN' : 'en-US') : t('Never', '从未')}</span><span>{t('Bookmarks', '收藏')}: {user.learningState.bookmarks?.length ?? 0}</span></div><div className="overflow-x-auto rounded-xl border border-border bg-background"><table className="w-full min-w-[720px] text-xs"><thead className="bg-muted/50 text-left font-black"><tr><th className="px-3 py-2">{t('Course', '课程')}</th><th className="px-3 py-2">{t('Completion', '完成度')}</th><th className="px-3 py-2">{t('Recorded quiz scores', '已记录测验成绩')}</th><th className="px-3 py-2">{t('Practice attempts', '练习次数')}</th><th className="px-3 py-2">{t('Last studied', '最近学习')}</th></tr></thead><tbody className="divide-y divide-border">{lessons.map((lesson) => {
      const state = progress[String(lesson.id)] ?? {}
      const completed = state.completed?.length ?? 0
      const total = lesson.totalUnits ?? 9
      const scores = Object.values(state.scores ?? {}).filter(Number.isFinite)
      const attempts = practice.filter((item) => item.lessonNumber === lesson.sequence)
      const attemptScores = attempts.map((item) => Number(item.score)).filter(Number.isFinite)
      return <tr key={lesson.id}><td className="px-3 py-2 font-bold">{String(lesson.sequence).padStart(2, '0')} · {isChinese ? lesson.titleZh : lesson.title}</td><td className="px-3 py-2"><div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, Math.round((completed / Math.max(1, total)) * 100))}%` }} /></div><span>{Math.min(100, Math.round((completed / Math.max(1, total)) * 100))}%</span></div></td><td className="px-3 py-2">{scores.length ? `${average(scores)}% · ${scores.length} ${t('units', '项')}` : '—'}</td><td className="px-3 py-2">{attempts.length ? `${attempts.length} · ${average(attemptScores)}%` : '—'}</td><td className="px-3 py-2 text-muted-foreground">{state.lastStudiedAt ? new Date(state.lastStudiedAt).toLocaleDateString(isChinese ? 'zh-CN' : 'en-US') : '—'}</td></tr>
    })}</tbody></table></div></td></tr>}
  </>
}
