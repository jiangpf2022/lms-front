'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, Clock3, Lightbulb, Loader2, LockKeyhole, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockContest, MockContestPhase } from '@/lib/modeling/mock-contests'

type ContestItem = MockContest & { phase: MockContestPhase }

export function MockContestDetail({ contestId, locale }: { contestId: string; locale: string }) {
  const isChinese = locale.startsWith('zh')
  const t = (en: string, zh: string) => isChinese ? zh : en
  const [item, setItem] = useState<ContestItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0)
  const [selectedProblem, setSelectedProblem] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const load = useCallback(async () => {
    const response = await fetch(`/api/modeling/mock-contests?id=${encodeURIComponent(contestId)}`, { cache: 'no-store' })
    const value = await response.json().catch(() => ({ items: [] })) as { items?: ContestItem[] }
    setItem(value.items?.[0] ?? null)
    setLoading(false)
  }, [contestId])
  useEffect(() => {
    queueMicrotask(() => { void load(); setNow(Date.now()) })
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [load])

  if (loading) return <div className="min-h-screen bg-[#f4f1e8] pt-32 text-center dark:bg-[#08110e]"><Loader2 className="mx-auto h-7 w-7 animate-spin" /></div>
  if (!item) return <div className="min-h-screen bg-[#f4f1e8] pt-32 text-center dark:bg-[#08110e]"><p className="font-bold">{t('Contest not found.', '未找到该模拟赛。')}</p><Link href={`/${locale}/mock-contests`} className="mt-4 inline-block underline">{t('Back', '返回')}</Link></div>

  const target = item.phase === 'upcoming' ? item.startsAt : item.endsAt
  const remaining = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000))
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  const locked = item.phase === 'upcoming'
  const format = (value: string) => new Intl.DateTimeFormat(isChinese ? 'zh-CN' : 'en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(value))

  return <div className="relative min-h-screen bg-[#f4f1e8] pt-16 text-[#17231d] dark:bg-[#08110e] dark:text-white">
    <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.06] dark:opacity-[0.035]" />
    <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={`/${locale}/mock-contests`} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> {t('All mock contests', '全部模拟赛')}</Link>
      <header className="mt-5 rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/90 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{t('Timed modeling challenge', '限时建模挑战')}</p><h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">{isChinese ? item.titleZh : item.title}</h1><p className="mt-4 text-base leading-8 text-muted-foreground">{isChinese ? item.summaryZh : item.summary}</p><p className="mt-4 text-xs text-muted-foreground">{format(item.startsAt)} — {format(item.endsAt)}</p></div>{item.phase === 'open' || item.phase === 'upcoming' ? <div className="rounded-2xl bg-[#10251b] px-5 py-4 text-center text-white"><div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">{item.phase === 'open' ? t('Time remaining', '剩余时间') : t('Starts in', '距离开始')}</div><div className="mt-1 font-mono text-2xl font-black">{days ? `${days}d ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div></div> : null}</div>
      </header>

      {locked ? <section className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center text-amber-900 dark:bg-amber-400/10 dark:text-amber-100"><LockKeyhole className="mx-auto h-8 w-8" /><h2 className="mt-3 text-xl font-black">{t('Problem directions are locked', '题目方向尚未开放')}</h2><p className="mt-2 text-sm leading-7">{t('The choices will appear automatically at the scheduled start time. You can review the schedule now, but the problem summaries remain hidden.', '到达规定开题时间后，题目选项会自动显示。现在可以查看赛程，但题目概要仍保持隐藏。')}</p></section> : <>
        <section className="mt-6 rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/[0.045] sm:p-8">
          <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"><Lightbulb className="h-5 w-5" /></div><div><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">{t('Pause before choosing', '选择之前，先停下来想一想')}</p><h2 className="mt-1 text-2xl font-black">{t('What would make one problem a better choice?', '什么会让一道题成为更好的选择？')}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{t('Do not begin by asking which algorithm looks impressive. First ask what decision the problem requires, what evidence is available, what must be assumed, and which uncertainty could reverse the conclusion. Compare the choices on those four questions before selecting one.', '先不要问哪一种算法看起来更高级。请先判断：题目最终要求做出什么决定？现有证据是什么？必须暂时接受哪些假设？哪一种不确定性可能推翻结论？比较完这四个问题，再选择题目。')}</p></div></div>
        </section>

        <section className="mt-6"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{t('Problem selection', '题目选择')}</p><h2 className="mt-1 text-3xl font-black">{t('Choose one direction', '选择一个方向')}</h2></div><span className="text-xs text-muted-foreground">{item.problems.length} {t('options', '个选项')}</span></div><div className="grid gap-4 md:grid-cols-2">{item.problems.map((problem) => {
          const selected = selectedProblem === problem.id
          return <button key={problem.id} type="button" onClick={() => setSelectedProblem(problem.id)} className={cn('relative rounded-3xl border p-6 text-left shadow-lg transition hover:-translate-y-0.5', selected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 dark:bg-emerald-400/10' : 'border-white/80 bg-white/90 hover:border-emerald-300 dark:border-white/10 dark:bg-white/[0.045]')}><span className="grid h-9 w-9 place-items-center rounded-full bg-[#163f2c] text-sm font-black text-white">{problem.code}</span><h3 className="mt-4 text-xl font-black">{isChinese ? problem.titleZh : problem.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{isChinese ? problem.briefZh : problem.brief}</p>{selected && <span className="absolute right-5 top-5 grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-4 w-4" /></span>}</button>
        })}</div></section>

        {selectedProblem && <section className="mt-6 overflow-hidden rounded-3xl border border-indigo-200 bg-white/90 shadow-xl dark:border-indigo-400/20 dark:bg-white/[0.045]"><button type="button" onClick={() => setShowGuide((value) => !value)} className="flex w-full items-center justify-between gap-4 p-6 text-left"><span><span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-indigo-700 dark:text-indigo-300"><Sparkles className="h-4 w-4" /> {t('Think first, then reveal', '先思考，再展开')}</span><strong className="mt-2 block text-xl">{t('Build the first modeling argument', '建立第一条建模论证')}</strong></span><ChevronDown className={cn('h-5 w-5 transition', showGuide && 'rotate-180')} /></button>{showGuide && <div className="border-t border-indigo-100 px-6 pb-7 pt-5 dark:border-indigo-400/15"><ol className="grid gap-4 text-sm leading-7 sm:grid-cols-2"><li className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-400/10"><strong>1. {t('Think', '先想')}</strong><p className="mt-1 text-muted-foreground">{t('Write the decision in one sentence without naming an algorithm.', '不用任何算法名称，用一句话写清楚最终要做出的决定。')}</p></li><li className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-400/10"><strong>2. {t('Represent', '再表示')}</strong><p className="mt-1 text-muted-foreground">{t('Identify states, controls, constraints, and evidence—with units.', '列出状态、决策、约束与证据，并标注单位。')}</p></li><li className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-400/10"><strong>3. {t('Derive', '再推导')}</strong><p className="mt-1 text-muted-foreground">{t('Start from the mechanism or balance law, then derive the formula one step at a time.', '从机制或守恒关系出发，一步一步得到公式。')}</p></li><li className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-400/10"><strong>4. {t('Challenge', '最后质疑')}</strong><p className="mt-1 text-muted-foreground">{t('Name one observation that would make the model inadequate.', '指出一种会证明当前模型不充分的观察结果。')}</p></li></ol></div>}</section>}
      </>}

      <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/55 p-6 dark:border-white/15 dark:bg-white/[0.025]"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 text-slate-500" /><div><h2 className="font-black">{t('Submission development status', '提交功能开发状态')}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{t('This release intentionally contains no file upload or PDF submission. Problem attachments, datasets, and final-paper delivery will be designed separately so large files are not stored in this application by accident.', '当前版本明确不包含文件上传或 PDF 提交。题目附件、数据集与最终论文提交会单独设计，避免大文件被意外存入本项目。')}</p></div></div></section>
    </main>
  </div>
}
