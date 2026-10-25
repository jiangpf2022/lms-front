'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  BookOpenCheck,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  LibraryBig,
  MessageSquareText,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import { GamificationHeaderCard } from '@/components/gamification/gamification-header-card'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type LessonSummary = { id: number; sequence: number; title: string; titleZh?: string; totalUnits: number }
type Progress = { completed: string[]; scores: Record<string, number>; xp: number; lastStudiedAt: string }
type BookmarkItem = {
  id: string
  lessonId: number
  lessonTitle: string
  chapterId: string
  chapterTitle: string
  courseTitle: string
  href: string
  savedAt: string
  note?: string
}

type LearningRecord = LessonSummary & Progress & { completion: number; mastery: number; retainedMastery: number }
type PracticeHistory = { id: string; mode: 'chapter' | 'random'; lessonNumber?: number; chapterIndex?: number; score: number; questionCount: number; completedAt: string }
type CloudLearningState = { progress: Record<string, Progress>; bookmarks: BookmarkItem[]; practiceHistory?: PracticeHistory[] }
type FeedbackSummary = { items: Array<{ status: 'pending' | 'adopted' | 'reviewed' }> }
const cloudStateKey = 'modeling-learning-center-v1'

function daysSince(date: string) {
  if (!date) return 0
  return Math.max(0, (Date.now() - new Date(date).getTime()) / 86_400_000)
}

function retention(mastery: number, days: number, stability = 14) {
  return mastery * Math.exp(-days / stability)
}

function levelFromXp(xp: number) {
  let level = 1
  let spent = 0
  while (xp >= spent + level * 100) {
    spent += level * 100
    level += 1
  }
  return { level, current: xp - spent, required: level * 100 }
}

function Curve({ mastery, isChinese }: { mastery: number; isChinese: boolean }) {
  const points = Array.from({ length: 31 }, (_, day) => ({ day, value: retention(mastery, day) }))
  const polyline = points.map((point) => `${(point.day / 30) * 720},${220 - (point.value / 100) * 190}`).join(' ')
  const thresholdY = 220 - 0.5 * 190
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 760 260" className="min-w-[660px] w-full" role="img" aria-label={isChinese ? '三十天遗忘曲线' : 'Thirty-day forgetting curve'}>
        <defs>
          <linearGradient id="curveArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d7d57" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2d7d57" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y={thresholdY} width="720" height={220 - thresholdY} fill="#ef4444" opacity="0.06" />
        {[0, 25, 50, 75, 100].map((value) => {
          const y = 220 - (value / 100) * 190
          return <g key={value}><line x1="0" x2="720" y1={y} y2={y} stroke="currentColor" opacity="0.1" /><text x="730" y={y + 4} className="fill-current text-[10px] opacity-50">{value}%</text></g>
        })}
        <line x1="0" x2="720" y1={thresholdY} y2={thresholdY} stroke="#ef4444" strokeDasharray="6 5" opacity="0.75" />
        <polygon points={`0,220 ${polyline} 720,220`} fill="url(#curveArea)" />
        <polyline points={polyline} fill="none" stroke="#2d7d57" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {[0, 7, 14, 21, 30].map((day) => <text key={day} x={(day / 30) * 720} y="245" textAnchor={day === 0 ? 'start' : day === 30 ? 'end' : 'middle'} className="fill-current text-[11px] opacity-60">{isChinese ? `第 ${day} 天` : `Day ${day}`}</text>)}
      </svg>
    </div>
  )
}

export function ModelingLearningCenter({ courseId, lessons, signedIn, locale }: { courseId: number; lessons: LessonSummary[]; signedIn: boolean; locale: string }) {
  const [progress, setProgress] = useState<Record<number, Progress>>({})
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistory[]>([])
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary>({ items: [] })
  const [curveLesson, setCurveLesson] = useState<number | 'all'>('all')
  const supabase = useMemo(() => createClient(), [])
  const isChinese = locale.toLowerCase().startsWith('zh')
  const localized = (path: string) => `/${locale}${path}`
  const t = (english: string, chinese: string) => isChinese ? chinese : english

  useEffect(() => {
    async function load() {
      const loaded: Record<number, Progress> = {}
      for (const lesson of lessons) {
        try {
          const raw = localStorage.getItem(`modeling-learning-progress:${lesson.id}`)
          if (raw) loaded[lesson.id] = JSON.parse(raw) as Progress
        } catch {
          // A single malformed local entry should not hide the rest of the center.
        }
      }
      let saved: BookmarkItem[] = []
      try {
        saved = JSON.parse(localStorage.getItem('modeling-learning-bookmarks') ?? '[]') as BookmarkItem[]
      } catch {
        saved = []
      }
      setProgress(loaded)
      setBookmarks(saved)
      try {
        setPracticeHistory(JSON.parse(localStorage.getItem('modeling-practice-history') ?? '[]') as PracticeHistory[])
      } catch {
        setPracticeHistory([])
      }
      if (signedIn) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data } = await supabase.from('user_ui_state').select('value').eq('user_id', session.user.id).eq('key', cloudStateKey).maybeSingle()
          const cloud = data?.value as unknown as CloudLearningState | null
          if (cloud) {
            const remoteProgress: Record<number, Progress> = {}
            for (const [lessonId, value] of Object.entries(cloud.progress ?? {})) {
              remoteProgress[Number(lessonId)] = value
              localStorage.setItem(`modeling-learning-progress:${lessonId}`, JSON.stringify(value))
            }
            setProgress((current) => ({ ...current, ...remoteProgress }))
            if (Array.isArray(cloud.bookmarks)) {
              setBookmarks(cloud.bookmarks)
              localStorage.setItem('modeling-learning-bookmarks', JSON.stringify(cloud.bookmarks))
            }
            if (Array.isArray(cloud.practiceHistory)) {
              setPracticeHistory(cloud.practiceHistory)
              localStorage.setItem('modeling-practice-history', JSON.stringify(cloud.practiceHistory))
            }
          }
        }
        const feedbackResponse = await fetch('/api/modeling/feedback', { cache: 'no-store' })
        if (feedbackResponse.ok) setFeedbackSummary(await feedbackResponse.json() as FeedbackSummary)
      }
    }
    queueMicrotask(() => { void load() })
  }, [lessons, signedIn, supabase])

  const records = useMemo<LearningRecord[]>(() => lessons.map((lesson) => {
    const stored = progress[lesson.id] ?? { completed: [], scores: {}, xp: 0, lastStudiedAt: '' }
    const scores = Object.values(stored.scores)
    const mastery = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0
    const completion = stored.completed.length ? Math.min(100, Math.round((stored.completed.length / Math.max(1, lesson.totalUnits)) * 100)) : 0
    return {
      ...lesson,
      ...stored,
      completion,
      mastery: Math.round(mastery),
      retainedMastery: Math.round(retention(mastery, daysSince(stored.lastStudiedAt))),
    }
  }), [lessons, progress])

  const activeRecords = records.filter((record) => record.completed.length > 0)
  const totalXp = activeRecords.reduce((sum, record) => sum + record.xp, 0)
  const level = levelFromXp(totalXp)
  const averageCompletion = activeRecords.length ? Math.round(activeRecords.reduce((sum, record) => sum + record.completion, 0) / activeRecords.length) : 0
  const averageMastery = activeRecords.length ? Math.round(activeRecords.reduce((sum, record) => sum + record.retainedMastery, 0) / activeRecords.length) : 0
  const chartMastery = curveLesson === 'all'
    ? averageMastery
    : records.find((record) => record.id === curveLesson)?.mastery ?? 0

  async function updateBookmarkNote(id: string, note: string) {
    const next = bookmarks.map((item) => item.id === id ? { ...item, note } : item)
    setBookmarks(next)
    localStorage.setItem('modeling-learning-bookmarks', JSON.stringify(next))
    if (!signedIn) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { data } = await supabase.from('user_ui_state').select('value').eq('user_id', session.user.id).eq('key', cloudStateKey).maybeSingle()
    const current = (data?.value as unknown as CloudLearningState | null) ?? { progress: {}, bookmarks: [] }
    await supabase.from('user_ui_state').upsert({
      user_id: session.user.id,
      key: cloudStateKey,
      value: JSON.parse(JSON.stringify({ ...current, bookmarks: next })),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' })
  }

  const achievements = [
    { icon: BookOpenCheck, title: t('First Step', '初次启程'), detail: t('Complete a chapter checkpoint', '完成一次章节测验'), earned: activeRecords.some((record) => record.completed.length >= 1) },
    { icon: Target, title: t('Model Builder', '模型构建者'), detail: t('Complete five learning units', '完成五个学习单元'), earned: activeRecords.reduce((sum, record) => sum + record.completed.length, 0) >= 5 },
    { icon: Star, title: t('Sharp Reasoning', '敏锐推理'), detail: t('Score at least 80% on a quiz', '在一次测验中达到 80%'), earned: activeRecords.some((record) => Object.values(record.scores).some((score) => score >= 80)) },
    { icon: Trophy, title: t('Blog Master', '博客精通者'), detail: t('Complete a 15-question checkpoint quiz', '完成一次 15 题综合检查'), earned: activeRecords.some((record) => record.completed.includes('final-quiz')) },
    { icon: Flame, title: t('Momentum', '保持势头'), detail: t('Earn 50 course XP', '获得 50 点课程经验'), earned: totalXp >= 50 },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1e8] pt-16 text-[#18231e] dark:bg-[#08110e] dark:text-white">
      <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.08] saturate-75 dark:opacity-[0.06]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#f8f6ef]/92 via-[#f4f1e8]/95 to-[#e9f0e9]/96 dark:from-[#08110e]/92 dark:via-[#08110e]/96 dark:to-[#0d1713]/97" />
      <main className="relative mx-auto max-w-[1280px] px-5 py-12 sm:px-8 lg:py-16">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-amber-700 dark:text-amber-300">{t('Personal study dashboard', '个人学习仪表盘')}</p>
            <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">{t('Learning Center', '学习中心')}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#54635b] dark:text-white/60">{t('Your chapter history, saved material, retained mastery, practice results, achievements, and XP—organized around deliberate review rather than passive reading.', '这里汇总章节进度、收藏内容、记忆保持度、练习成绩、成就与经验值，让复习真正围绕薄弱点展开。')}</p>
          </div>
          {signedIn ? <GamificationHeaderCard /> : <Link prefetch href={localized(`/auth/login?next=${encodeURIComponent(localized('/learning-center'))}`)} className="rounded-full bg-[#163f2c] px-5 py-2.5 text-sm font-black text-white shadow-lg">{t('Sign in to sync across devices', '登录后跨设备同步')}</Link>}
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            [GraduationCap, `${t('Level', '等级')} ${level.level}`, `${level.current} / ${level.required} ${t('XP to next level', '经验可升级')}`],
            [BookOpenCheck, `${averageCompletion}%`, t('average completion', '平均完成度')],
            [Target, `${averageMastery}%`, t('retained mastery', '当前记忆保持度')],
            [Bookmark, String(bookmarks.length), t('saved chapters', '收藏章节')],
            [MessageSquareText, String(feedbackSummary.items.length), t('suggestions sent', '已提交建议')],
            [CheckCircle2, String(feedbackSummary.items.filter((item) => item.status === 'adopted').length), t('suggestions adopted', '建议被采纳')],
          ].map(([Icon, value, label]) => {
            const MetricIcon = Icon as typeof GraduationCap
            return <div key={String(label)} className="rounded-[26px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_70px_-48px_rgba(20,50,35,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"><MetricIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" /><div className="mt-4 text-3xl font-black">{String(value)}</div><p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{String(label)}</p></div>
          })}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[30px] border border-white/80 bg-white/84 p-5 shadow-[0_30px_90px_-55px_rgba(20,50,35,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/86 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t('Ebbinghaus review model', '艾宾浩斯复习模型')}</p><h2 className="mt-1 text-2xl font-black">{t('Forgetting Curve', '遗忘曲线')}</h2></div>
              <select value={curveLesson} onChange={(event) => setCurveLesson(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="rounded-full border border-[#cad7ce] bg-white px-4 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/5">
                <option value="all">{t('All active blogs', '全部已学习博客')}</option>
                {activeRecords.map((record) => <option key={record.id} value={record.id}>{t('Blog', '博客')} {record.sequence}: {isChinese ? record.titleZh ?? record.title : record.title}</option>)}
              </select>
            </div>
            <Curve mastery={chartMastery} isChinese={isChinese} />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{t('The curve uses R(t)=R₀e^(−t/14) as a transparent review signal, not a neurological diagnosis. The red region marks retained mastery below 50%.', '曲线使用 R(t)=R₀e^(−t/14) 提供透明的复习提示，而非医学诊断；红色区域表示记忆保持度低于 50%。')}</p>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-[#112f22] p-6 text-white shadow-[0_30px_90px_-55px_rgba(20,50,35,0.8)] dark:border-white/10">
            <Sparkles className="h-7 w-7 text-amber-300" />
            <h2 className="mt-5 text-2xl font-black">{t('Review Queue', '优先复习队列')}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{t('Blogs below 50% retained mastery should be reviewed first.', '记忆保持度低于 50% 的博客会优先出现在这里。')}</p>
            <div className="mt-6 space-y-3">
              {activeRecords.filter((record) => record.retainedMastery < 50).slice(0, 5).map((record) => <Link prefetch key={record.id} href={localized(`/courses/${courseId}/lessons/${record.id}`)} className="flex items-center justify-between gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 transition hover:bg-rose-300/15"><div><div className="text-sm font-black">{isChinese ? record.titleZh ?? record.title : record.title}</div><div className="mt-1 text-xs text-rose-100/60">{record.retainedMastery}% {t('retained mastery', '记忆保持度')}</div></div><ChevronRight className="h-4 w-4" /></Link>)}
              {activeRecords.filter((record) => record.retainedMastery < 50).length === 0 && <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/55">{t('Complete a checkpoint to build your personalized review queue.', '完成章节测验后，这里会生成你的个性化复习队列。')}</div>}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/80 bg-white/84 p-5 shadow-[0_30px_90px_-55px_rgba(20,50,35,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/86 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{t('Course activity', '课程活动')}</p><h2 className="mt-1 text-2xl font-black">{t('Learning Record', '学习记录')}</h2></div><CalendarClock className="h-7 w-7 text-amber-600" /></div>
          <div className="grid gap-3">
            {records.map((record) => <Link prefetch key={record.id} href={localized(`/courses/${courseId}/lessons/${record.id}`)} className="grid items-center gap-4 rounded-2xl border border-[#dce5df] bg-white/60 p-4 transition hover:border-emerald-400 hover:bg-emerald-50/55 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-emerald-400/10 sm:grid-cols-[1fr_160px_110px]">
              <div className="min-w-0"><div className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('Blog', '博客')} {record.sequence}</div><div className="mt-1 truncate font-black">{isChinese ? record.titleZh ?? record.title : record.title}</div><div className="mt-1 text-xs text-muted-foreground">{record.lastStudiedAt ? `${t('Last studied', '上次学习')} ${new Date(record.lastStudiedAt).toLocaleDateString(isChinese ? 'zh-CN' : 'en-US')}` : t('Not started', '尚未开始')}</div></div>
              <div><div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground"><span>{t('Progress', '进度')}</span><span>{record.completion}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e3ebe5] dark:bg-white/10"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${record.completion}%` }} /></div></div>
              <div className={cn('rounded-xl px-3 py-2 text-center text-sm font-black', record.retainedMastery > 0 && record.retainedMastery < 50 ? 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300')}>{record.retainedMastery}% {t('mastery', '熟练度')}</div>
            </Link>)}
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/80 bg-white/84 p-5 shadow-[0_30px_90px_-55px_rgba(20,50,35,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/86 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">{t('Assessment activity', '测验活动')}</p><h2 className="mt-1 text-2xl font-black">{t('Practice History', '练习记录')}</h2></div>
            <Link prefetch href={localized('/practice-center')} className="rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-indigo-600">{t('Open Practice Center', '进入练习中心')}</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {practiceHistory.slice(0, 8).map((attempt) => (
              <div key={attempt.id} className="rounded-2xl border border-[#dce5df] bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">{attempt.mode === 'random' ? t('Random practice', '随机练习') : t('Chapter checkpoint', '章节测验')}</div>
                <div className="mt-3 text-2xl font-black">{attempt.score}%</div>
                <div className="mt-1 text-xs text-muted-foreground">{attempt.lessonNumber ? `${t('Blog', '博客')} ${attempt.lessonNumber}${attempt.chapterIndex !== undefined ? ` · ${t('Chapter', '章节')} ${attempt.chapterIndex + 1}` : ''}` : t('Mixed question bank', '混合题库')}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{attempt.questionCount} {t('questions', '道题')}</div>
                <div className="mt-3 text-[11px] text-muted-foreground">{new Date(attempt.completedAt).toLocaleString(isChinese ? 'zh-CN' : 'en-US')}</div>
              </div>
            ))}
            {practiceHistory.length === 0 && <div className="rounded-2xl border border-dashed border-[#cad7ce] p-7 text-center text-sm text-muted-foreground dark:border-white/15 sm:col-span-2 lg:col-span-4">{t('Your chapter and random-practice results will appear here.', '完成章节测验或随机练习后，成绩会显示在这里。')}</div>}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/80 bg-white/84 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/86 sm:p-7">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{t('Saved for review', '收藏以便复习')}</p><h2 className="mt-1 text-2xl font-black">{t('Bookmarks', '收藏夹')}</h2></div><LibraryBig className="h-7 w-7 text-amber-600" /></div>
            <div className="space-y-3">
              {bookmarks.map((item) => <div key={item.id} className="rounded-2xl border border-[#dce5df] p-4 transition hover:border-amber-400 hover:bg-amber-50/60 dark:border-white/10 dark:hover:bg-amber-400/10"><Link prefetch href={item.href} className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate font-black">{item.chapterTitle}</div><div className="mt-1 truncate text-xs text-muted-foreground">{item.lessonTitle} · {t('saved', '收藏于')} {new Date(item.savedAt).toLocaleDateString(isChinese ? 'zh-CN' : 'en-US')}</div></div><ChevronRight className="h-4 w-4 shrink-0" /></Link><textarea defaultValue={item.note ?? ''} onBlur={(event) => { void updateBookmarkNote(item.id, event.currentTarget.value) }} placeholder={t('Add a review note…', '添加复习批注…')} className="mt-3 min-h-20 w-full resize-y rounded-xl border border-[#dce5df] bg-white/75 px-3 py-2 text-sm outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-black/15" /></div>)}
              {bookmarks.length === 0 && <div className="rounded-2xl border border-dashed border-[#cad7ce] p-7 text-center text-sm text-muted-foreground dark:border-white/15"><Bookmark className="mx-auto mb-3 h-6 w-6" />{t('Use “Save chapter” while reading to build a focused review shelf.', '阅读时使用“收藏章节”，逐步建立自己的重点复习架。')}</div>}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/84 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/86 sm:p-7">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t('Milestones', '学习里程碑')}</p><h2 className="mt-1 text-2xl font-black">{t('Achievements', '成就')}</h2></div><Award className="h-7 w-7 text-emerald-700 dark:text-emerald-300" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((achievement) => <div key={achievement.title} className={cn('rounded-2xl border p-4', achievement.earned ? 'border-amber-300 bg-amber-50/80 dark:border-amber-300/25 dark:bg-amber-300/10' : 'border-[#dce5df] bg-[#f5f7f5]/75 opacity-60 dark:border-white/10 dark:bg-white/[0.03]')}><div className="flex items-center gap-3">{achievement.earned ? <achievement.icon className="h-6 w-6 text-amber-600" /> : <LockKeyhole className="h-5 w-5 text-muted-foreground" />}<div><div className="font-black">{achievement.title}</div><div className="mt-1 text-xs leading-5 text-muted-foreground">{achievement.detail}</div></div></div></div>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
