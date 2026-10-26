'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown, BookOpenText, CheckCircle2, Clock3, Eye, EyeOff, LayoutDashboard, MessageSquareText, RefreshCcw, ShieldCheck, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelingVisibility } from '@/lib/modeling/developer-settings'
import { ModelingMockContestManager } from '@/components/modeling/modeling-mock-contest-manager'
import { ModelingUserAnalytics } from '@/components/modeling/modeling-user-analytics'

type DeveloperLesson = {
  id: number
  sequence: number
  title: string
  titleZh: string
  level: number
  databaseStatus: string
  totalUnits?: number
}

type Feedback = {
  id: string
  userId: string
  user: { email?: string; name?: string }
  lessonId: number
  lessonTitle: string
  chapterTitle: string
  message: string
  status: 'pending' | 'adopted' | 'reviewed'
  createdAt: string
}

const visibilityOptions: Array<{ value: ModelingVisibility; icon: typeof Eye; en: string; zh: string; classes: string }> = [
  { value: 'public', icon: Eye, en: 'Public', zh: '完全公开', classes: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200' },
  { value: 'coming-soon', icon: Clock3, en: 'Coming soon', zh: '准备公开', classes: 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200' },
  { value: 'hidden', icon: EyeOff, en: 'Hidden', zh: '完全隐藏', classes: 'border-slate-300 bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-white/60' },
]

export function ModelingDeveloperCenter({ lessons, locale }: { lessons: DeveloperLesson[]; locale: string }) {
  const isChinese = locale.toLowerCase().startsWith('zh')
  const t = (en: string, zh: string) => isChinese ? zh : en
  const [states, setStates] = useState<Record<string, ModelingVisibility>>({})
  const [levels, setLevels] = useState<Record<string, 1 | 2 | 3>>({})
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activePanel, setActivePanel] = useState<'library' | 'users' | 'contests' | 'feedback'>('library')
  const [sortKey, setSortKey] = useState<'sequence' | 'title' | 'level' | 'visibility'>('sequence')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const refresh = useCallback(async () => {
    const [settingsResponse, feedbackResponse] = await Promise.all([
      fetch('/api/modeling/developer', { cache: 'no-store' }),
      fetch('/api/modeling/feedback', { cache: 'no-store' }),
    ])
    if (settingsResponse.ok) {
      const value = await settingsResponse.json() as { courseStates?: Record<string, ModelingVisibility>; courseLevels?: Record<string, 1 | 2 | 3> }
      setStates(value.courseStates ?? {})
      setLevels(value.courseLevels ?? {})
    }
    if (feedbackResponse.ok) {
      const value = await feedbackResponse.json() as { items?: Feedback[] }
      setFeedback(value.items ?? [])
    }
  }, [])

  useEffect(() => { queueMicrotask(() => { void refresh() }) }, [refresh])

  const resolvedStates = useMemo(() => Object.fromEntries(lessons.map((lesson) => [
    String(lesson.sequence),
    states[String(lesson.sequence)] ?? (lesson.databaseStatus === 'published' ? 'public' : 'hidden'),
  ])) as Record<string, ModelingVisibility>, [lessons, states])

  const resolvedLevels = useMemo(() => Object.fromEntries(lessons.map((lesson) => [
    String(lesson.sequence),
    levels[String(lesson.sequence)] ?? lesson.level,
  ])) as Record<string, 1 | 2 | 3>, [lessons, levels])

  const sortedLessons = useMemo(() => [...lessons].sort((left, right) => {
    const leftValue = sortKey === 'visibility'
      ? resolvedStates[String(left.sequence)]
      : sortKey === 'title'
        ? (isChinese ? left.titleZh : left.title)
        : sortKey === 'level'
          ? resolvedLevels[String(left.sequence)]
          : left.sequence
    const rightValue = sortKey === 'visibility'
      ? resolvedStates[String(right.sequence)]
      : sortKey === 'title'
        ? (isChinese ? right.titleZh : right.title)
        : sortKey === 'level'
          ? resolvedLevels[String(right.sequence)]
          : right.sequence
    const result = typeof leftValue === 'number' && typeof rightValue === 'number'
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue), isChinese ? 'zh-CN' : 'en-US')
    return sortDirection === 'asc' ? result : -result
  }), [isChinese, lessons, resolvedLevels, resolvedStates, sortDirection, sortKey])

  function changeSort(nextKey: typeof sortKey) {
    if (sortKey === nextKey) setSortDirection((value) => value === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(nextKey)
      setSortDirection('asc')
    }
  }

  async function saveStates() {
    setSaving(true)
    setSaved(false)
    const response = await fetch('/api/modeling/developer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseStates: resolvedStates, courseLevels: resolvedLevels }),
    })
    setSaving(false)
    setSaved(response.ok)
  }

  async function updateFeedback(item: Feedback, status: Feedback['status']) {
    const response = await fetch('/api/modeling/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: item.userId, feedbackId: item.id, status }),
    })
    if (response.ok) setFeedback((current) => current.map((entry) => entry.id === item.id && entry.userId === item.userId ? { ...entry, status } : entry))
  }

  return (
    <div className="relative min-h-screen bg-[#f4f1e8] pt-16 text-[#18231e] dark:bg-[#08110e] dark:text-white">
      <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.055] dark:opacity-[0.04]" />
      <main className="relative mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="h-fit rounded-2xl border border-white/80 bg-white/88 p-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/90 lg:sticky lg:top-24">
          <div className="border-b border-border px-3 pb-4 pt-2">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-700 dark:text-rose-300"><ShieldCheck className="h-3.5 w-3.5" /> {t('Developer only', '仅开发者')}</p>
            <h1 className="mt-2 text-xl font-black tracking-tight">{t('Developer Center', '开发者中心')}</h1>
          </div>
          <nav className="mt-3 grid gap-1">
            <button onClick={() => setActivePanel('library')} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition', activePanel === 'library' ? 'bg-[#163f2c] text-white' : 'text-muted-foreground hover:bg-muted')}><BookOpenText className="h-4 w-4" /> {t('Course Library', '课程库')}</button>
            <button onClick={() => setActivePanel('users')} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition', activePanel === 'users' ? 'bg-sky-700 text-white' : 'text-muted-foreground hover:bg-muted')}><Users className="h-4 w-4" /> {t('User Analytics', '用户分析')}</button>
            <button onClick={() => setActivePanel('contests')} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition', activePanel === 'contests' ? 'bg-amber-600 text-white' : 'text-muted-foreground hover:bg-muted')}><Trophy className="h-4 w-4" /> {t('Mock Contests', '模拟赛')}</button>
            <button onClick={() => setActivePanel('feedback')} className={cn('flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition', activePanel === 'feedback' ? 'bg-indigo-700 text-white' : 'text-muted-foreground hover:bg-muted')}><span className="flex items-center gap-3"><MessageSquareText className="h-4 w-4" /> {t('Feedback', '意见反馈')}</span>{feedback.filter((item) => item.status === 'pending').length > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-950">{feedback.filter((item) => item.status === 'pending').length}</span>}</button>
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            <Link href={`/${locale}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted"><LayoutDashboard className="h-4 w-4" /> {t('Back to site', '返回网站')}</Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-3xl font-black tracking-[-0.035em]">{{ library: t('Course Library', '课程库'), users: t('User Analytics', '用户分析'), contests: t('Mock Contests', '模拟赛'), feedback: t('Reader Feedback', '意见反馈') }[activePanel]}</h2><p className="mt-1 text-sm text-muted-foreground">{{ library: t('Sort lessons and manage publication status in one compact table.', '用紧凑表格排序课程并管理公开状态。'), users: t('Manage Level 0–3 access and inspect synced course and quiz performance.', '管理 Level 0–3 权限，并分析已同步的课程进度与测验表现。'), contests: t('Schedule timed contests and prepare problem choices without storing files.', '安排限时模拟赛并准备题目选项，不保存上传文件。'), feedback: t('Review suggestions and record whether they were adopted.', '查看读者建议并记录是否采纳。') }[activePanel]}</p></div>
            <button onClick={() => { void refresh() }} className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-white/80 px-4 text-xs font-black dark:bg-white/5"><RefreshCcw className="h-3.5 w-3.5" /> {t('Refresh', '刷新')}</button>
          </header>

          {activePanel === 'library' && <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">{t(`${lessons.length} lessons · click a column header to sort`, `${lessons.length} 门课程 · 点击表头即可排序`)}</p>
              <button onClick={() => { void saveStates() }} disabled={saving} className="rounded-full bg-[#163f2c] px-5 py-2 text-xs font-black text-white disabled:opacity-50">{saving ? t('Saving…', '保存中…') : saved ? t('Saved', '已保存') : t('Save changes', '保存更改')}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-sm">
                <thead className="bg-[#eef3ee] text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#56665d] dark:bg-white/[0.04] dark:text-white/55">
                  <tr>
                    {([
                      ['sequence', t('No.', '编号')],
                      ['title', t('Course', '课程名称')],
                      ['level', t('Level', '级别')],
                      ['visibility', t('Visibility', '公开状态')],
                    ] as const).map(([key, label]) => <th key={key} className="px-4 py-3"><button onClick={() => changeSort(key)} className="inline-flex items-center gap-1.5 hover:text-foreground">{label}<ArrowUpDown className={cn('h-3 w-3', sortKey === key ? 'opacity-100' : 'opacity-35')} /></button></th>)}
                    <th className="px-4 py-3 text-right">{t('Actions', '操作')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedLessons.map((lesson) => {
                    const selected = resolvedStates[String(lesson.sequence)]
                    const selectedLevel = resolvedLevels[String(lesson.sequence)]
                    const selectedOption = visibilityOptions.find((option) => option.value === selected) ?? visibilityOptions[2]
                    const SelectedIcon = selectedOption.icon
                    return <tr key={lesson.sequence} className="transition hover:bg-[#f5f8f5] dark:hover:bg-white/[0.025]">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-black text-muted-foreground">{String(lesson.sequence).padStart(2, '0')}</td>
                      <td className="px-4 py-3"><div className="max-w-xl font-bold">{isChinese ? lesson.titleZh : lesson.title}</div></td>
                      <td className="whitespace-nowrap px-4 py-3"><label className={cn('inline-flex items-center rounded-lg border px-2.5 py-1.5', selectedLevel === 1 ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : selectedLevel === 2 ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-rose-300 bg-rose-50 text-rose-800')}><select aria-label={t(`Level for ${lesson.title}`, `${lesson.titleZh} 的课程级别`)} value={selectedLevel} onChange={(event) => { setLevels((current) => ({ ...current, [String(lesson.sequence)]: Number(event.target.value) as 1 | 2 | 3 })); setSaved(false) }} className="bg-transparent text-xs font-black outline-none"><option value={1}>{t('Level 1', '级别 1')}</option><option value={2}>{t('Level 2', '级别 2')}</option><option value={3}>{t('Level 3', '级别 3')}</option></select></label></td>
                      <td className="px-4 py-3"><label className={cn('inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5', selectedOption.classes)}><SelectedIcon className="h-3.5 w-3.5" /><select aria-label={t(`Visibility for ${lesson.title}`, `${lesson.titleZh} 的公开状态`)} value={selected} onChange={(event) => { setStates((current) => ({ ...current, [String(lesson.sequence)]: event.target.value as ModelingVisibility })); setSaved(false) }} className="bg-transparent text-xs font-black outline-none"><option value="public">{t('Public', '完全公开')}</option><option value="coming-soon">{t('Coming soon', '准备公开')}</option><option value="hidden">{t('Hidden', '完全隐藏')}</option></select></label></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right"><Link href={`/${locale}/courses/1/lessons/${lesson.id}`} className="rounded-full border border-border px-3 py-1.5 text-xs font-black hover:bg-muted">{t('Preview', '预览')}</Link></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </section>}

          {activePanel === 'users' && <ModelingUserAnalytics lessons={lessons} locale={locale} />}

          {activePanel === 'contests' && <ModelingMockContestManager locale={locale} />}

          {activePanel === 'feedback' && <section className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.045] sm:p-5">
            <div className="space-y-3">
              {feedback.map((item) => <article key={`${item.userId}:${item.id}`} className="rounded-xl border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-black text-indigo-700 dark:text-indigo-300">{item.lessonTitle} · {item.chapterTitle}</div><div className="mt-1 text-[11px] text-muted-foreground">{item.user.name || item.user.email || item.userId} · {new Date(item.createdAt).toLocaleString(isChinese ? 'zh-CN' : 'en-US')}</div></div><span className={cn('rounded-full px-3 py-1 text-[10px] font-black uppercase', item.status === 'adopted' ? 'bg-emerald-100 text-emerald-800' : item.status === 'reviewed' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800')}>{isChinese ? ({ pending: '待处理', adopted: '已采纳', reviewed: '已查看' } as const)[item.status] : item.status}</span></div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item.message}</p>
                <div className="mt-3 flex gap-2"><button onClick={() => { void updateFeedback(item, 'adopted') }} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-black text-white"><CheckCircle2 className="h-3.5 w-3.5" /> {t('Adopt', '采纳')}</button><button onClick={() => { void updateFeedback(item, 'reviewed') }} className="rounded-full border border-border px-4 py-1.5 text-xs font-black">{t('Mark reviewed', '标记已查看')}</button></div>
              </article>)}
              {feedback.length === 0 && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t('No reader suggestions yet.', '暂时还没有读者建议。')}</div>}
            </div>
          </section>}
        </div>
      </main>
    </div>
  )
}
