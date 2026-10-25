'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock3, Eye, EyeOff, MessageSquareText, RefreshCcw, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelingVisibility } from '@/lib/modeling/developer-settings'

type DeveloperLesson = {
  id: number
  sequence: number
  title: string
  titleZh: string
  level: number
  databaseStatus: string
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
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const refresh = useCallback(async () => {
    const [settingsResponse, feedbackResponse] = await Promise.all([
      fetch('/api/modeling/developer', { cache: 'no-store' }),
      fetch('/api/modeling/feedback', { cache: 'no-store' }),
    ])
    if (settingsResponse.ok) {
      const value = await settingsResponse.json() as { courseStates?: Record<string, ModelingVisibility> }
      setStates(value.courseStates ?? {})
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

  async function saveStates() {
    setSaving(true)
    setSaved(false)
    const response = await fetch('/api/modeling/developer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseStates: resolvedStates }),
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
      <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.07] dark:opacity-[0.05]" />
      <main className="relative mx-auto max-w-[1280px] px-5 py-12 sm:px-8 lg:py-16">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300"><ShieldCheck className="h-4 w-4" /> {t('Developer only', '仅开发者可见')}</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">{t('Developer Center', '开发者中心')}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{t('Control what readers can discover, review suggestions, and decide which ideas are adopted. These controls are protected by server-side account verification.', '管理读者能够发现的课程、查看读者建议，并标记哪些建议已被采纳。这里的权限由服务端账号验证保护。')}</p>
          </div>
          <button onClick={() => { void refresh() }} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/80 px-5 text-sm font-black dark:bg-white/5"><RefreshCcw className="h-4 w-4" /> {t('Refresh', '刷新')}</button>
        </header>

        <section className="mt-9 rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.045] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t('Publication states', '发布状态')}</p><h2 className="mt-1 text-2xl font-black">{t('Course Library', '课程库')}</h2></div>
            <button onClick={() => { void saveStates() }} disabled={saving} className="rounded-full bg-[#163f2c] px-6 py-2.5 text-sm font-black text-white disabled:opacity-50">{saving ? t('Saving…', '保存中…') : saved ? t('Saved', '已保存') : t('Save visibility', '保存发布状态')}</button>
          </div>
          <div className="mt-6 grid gap-3">
            {lessons.map((lesson) => {
              const selected = resolvedStates[String(lesson.sequence)]
              return <article key={lesson.sequence} className="grid gap-4 rounded-2xl border border-border bg-background/70 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div><div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{isChinese ? `博客 ${String(lesson.sequence).padStart(2, '0')} · 级别 ${lesson.level}` : `Blog ${String(lesson.sequence).padStart(2, '0')} · Level ${lesson.level}`}</div><h3 className="mt-1 text-lg font-black">{isChinese ? lesson.titleZh : lesson.title}</h3></div>
                <div className="flex flex-wrap gap-2">
                  {visibilityOptions.map((option) => <button key={option.value} onClick={() => { setStates((current) => ({ ...current, [String(lesson.sequence)]: option.value })); setSaved(false) }} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-black transition', selected === option.value ? option.classes : 'border-border bg-transparent text-muted-foreground opacity-55 hover:opacity-100')}><option.icon className="h-3.5 w-3.5" /> {isChinese ? option.zh : option.en}</button>)}
                  <Link href={`/${locale}/courses/1/lessons/${lesson.id}`} className="rounded-full border border-border px-3 py-2 text-xs font-black hover:bg-muted">{t('Preview', '预览')}</Link>
                </div>
              </article>
            })}
          </div>
        </section>

        <section className="mt-9 rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.045] sm:p-7">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300"><MessageSquareText className="h-4 w-4" /> {t('Reader feedback', '读者反馈')}</p><h2 className="mt-1 text-2xl font-black">{t('Suggestions', '建议')}</h2></div>
          <div className="mt-6 space-y-3">
            {feedback.map((item) => <article key={`${item.userId}:${item.id}`} className="rounded-2xl border border-border bg-background/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-black text-indigo-700 dark:text-indigo-300">{item.lessonTitle} · {item.chapterTitle}</div><div className="mt-1 text-[11px] text-muted-foreground">{item.user.name || item.user.email || item.userId} · {new Date(item.createdAt).toLocaleString(isChinese ? 'zh-CN' : 'en-US')}</div></div><span className={cn('rounded-full px-3 py-1 text-[10px] font-black uppercase', item.status === 'adopted' ? 'bg-emerald-100 text-emerald-800' : item.status === 'reviewed' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800')}>{isChinese ? ({ pending: '待处理', adopted: '已采纳', reviewed: '已查看' } as const)[item.status] : item.status}</span></div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{item.message}</p>
              <div className="mt-4 flex gap-2"><button onClick={() => { void updateFeedback(item, 'adopted') }} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white"><CheckCircle2 className="h-3.5 w-3.5" /> {t('Adopt', '采纳')}</button><button onClick={() => { void updateFeedback(item, 'reviewed') }} className="rounded-full border border-border px-4 py-2 text-xs font-black">{t('Mark reviewed', '标记已查看')}</button></div>
            </article>)}
            {feedback.length === 0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t('No reader suggestions yet.', '暂时还没有读者建议。')}</div>}
          </div>
        </section>
      </main>
    </div>
  )
}
