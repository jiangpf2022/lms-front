'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarClock, CircleDot, Clock3, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockContest, MockContestPhase } from '@/lib/modeling/mock-contests'

type ContestItem = MockContest & { phase: MockContestPhase }

function phaseStyle(phase: MockContestPhase) {
  if (phase === 'open') return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200'
  if (phase === 'upcoming') return 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200'
  if (phase === 'closed') return 'border-slate-300 bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-white/60'
  return 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200'
}

export function MockContestCenter({ locale }: { locale: string }) {
  const isChinese = locale.startsWith('zh')
  const t = (en: string, zh: string) => isChinese ? zh : en
  const [items, setItems] = useState<ContestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0)
  const load = useCallback(async () => {
    const response = await fetch('/api/modeling/mock-contests', { cache: 'no-store' })
    const value = await response.json().catch(() => ({ items: [] })) as { items?: ContestItem[] }
    setItems(value.items ?? [])
    setLoading(false)
  }, [])
  useEffect(() => {
    queueMicrotask(() => { void load(); setNow(Date.now()) })
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [load])
  const ordered = useMemo(() => [...items].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [items])
  const format = (value: string) => new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(value))
  const countdown = (item: ContestItem) => {
    const target = item.phase === 'upcoming' ? new Date(item.startsAt).getTime() : new Date(item.endsAt).getTime()
    const seconds = Math.max(0, Math.floor((target - now) / 1000))
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  }
  const phaseLabel = (phase: MockContestPhase) => isChinese
    ? ({ draft: '草稿', upcoming: '即将开始', open: '正在进行', closed: '已结束' } as const)[phase]
    : ({ draft: 'Draft', upcoming: 'Upcoming', open: 'Open now', closed: 'Closed' } as const)[phase]

  return <div className="relative min-h-screen overflow-hidden bg-[#f4f1e8] pt-16 text-[#17231d] dark:bg-[#08110e] dark:text-white">
    <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.07] dark:opacity-[0.035]" />
    <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="rounded-[2rem] border border-white/80 bg-white/88 p-7 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/90 sm:p-10">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300"><Trophy className="h-4 w-4" /> {t('Competition Lab', '竞赛训练场')}</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-6xl">{t('Timed Mock Contests', '限时模拟赛')}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">{t('Practice the decisions that matter before a real contest: read several problem directions, choose one deliberately, and organize your modeling under a fixed clock.', '在真实比赛之前，先练习最重要的决策：阅读多个题目方向，有依据地选择一道题，并在固定时间内组织建模过程。')}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[t('Compare problem directions', '比较题目方向'), t('Choose one problem', '选择一道题目'), t('Work under a deadline', '限时完成建模')].map((label, index) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#eef3ee] px-4 py-3 text-sm font-bold dark:bg-white/[0.06]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#163f2c] text-xs text-white">{index + 1}</span>{label}</div>)}
        </div>
        <p className="mt-5 text-xs leading-6 text-muted-foreground">{t('File delivery and PDF submission will be added in a later development phase. This version stores no uploaded files.', '题目附件与 PDF 提交将在后续版本开发；当前版本不会接收或保存上传文件。')}</p>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {ordered.map((item) => <article key={item.id} className="group rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-[#0d1713]/90">
          <div className="flex items-center justify-between gap-3"><span className={cn('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]', phaseStyle(item.phase))}>{phaseLabel(item.phase)}</span>{item.phase === 'open' || item.phase === 'upcoming' ? <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">{countdown(item)}</span> : null}</div>
          <h2 className="mt-5 text-2xl font-black tracking-tight">{isChinese ? item.titleZh : item.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{isChinese ? item.summaryZh : item.summary}</p>
          <div className="mt-5 grid gap-2 text-xs text-muted-foreground"><div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-emerald-700" /> {t('Opens', '开题')} · {format(item.startsAt)}</div><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-rose-600" /> {t('Deadline', '截止')} · {format(item.endsAt)}</div><div className="flex items-center gap-2"><CircleDot className="h-4 w-4 text-indigo-600" /> {item.problems.length} {t('problem options', '个题目方向')}</div></div>
          <Link href={`/${locale}/mock-contests/${item.id}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#163f2c] px-5 py-2.5 text-xs font-black text-white transition group-hover:bg-emerald-800">{item.phase === 'upcoming' ? t('View schedule', '查看赛程') : t('Enter contest', '进入模拟赛')}<ArrowRight className="h-4 w-4" /></Link>
        </article>)}
        {!loading && ordered.length === 0 && <div className="md:col-span-2 rounded-3xl border border-dashed border-[#8aa093] bg-white/60 p-12 text-center dark:bg-white/[0.035]"><Trophy className="mx-auto h-8 w-8 text-emerald-700" /><p className="mt-3 font-bold">{t('No mock contest has been scheduled yet.', '暂时还没有已安排的模拟赛。')}</p><p className="mt-2 text-sm text-muted-foreground">{t('The developer can create the first schedule in Developer Center.', '开发者可以在开发者中心创建第一场赛程。')}</p></div>}
      </section>
    </main>
  </div>
}
