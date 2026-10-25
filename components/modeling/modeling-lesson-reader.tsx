'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  MessageSquareText,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
} from 'lucide-react'
import type { SerializeResult } from 'next-mdx-remote-client'
import { LessonContent } from '@/app/[locale]/dashboard/student/courses/[courseId]/lessons/[lessonId]/lesson-content'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ModelingQuizQuestion } from '@/lib/modeling/math-quiz-bank'
import { modelingLevelBadgeClasses, modelingLevelIconClasses, modelingLevelTitleClasses } from '@/lib/modeling/level-styles'

type SerializedChapter = {
  id: string
  title: string
  mdx: SerializeResult | null
  quiz: ModelingQuizQuestion[]
}

export type ReaderLanguage = 'en' | 'zh'

type StoredProgress = {
  completed: string[]
  scores: Record<string, number>
  xp: number
  lastStudiedAt: string
}

type SavedChapter = {
  id: string
  lessonId: number
  lessonTitle: string
  chapterId: string
  chapterTitle: string
  courseTitle: string
  href: string
  savedAt: string
}

const emptyProgress: StoredProgress = { completed: [], scores: {}, xp: 0, lastStudiedAt: '' }
const cloudStateKey = 'modeling-learning-center-v1'

type CloudLearningState = {
  progress: Record<string, StoredProgress>
  bookmarks: SavedChapter[]
  practiceHistory?: unknown[]
}

function sameAnswers(selected: number[], correct: number[]) {
  return selected.length === correct.length && selected.every((answer) => correct.includes(answer))
}

export function ModelingQuiz({
  questions,
  language,
  title,
  description,
  submitLabel,
  previousScore,
  onSubmit,
}: {
  questions: ModelingQuizQuestion[]
  language: ReaderLanguage
  title: string
  description: string
  submitLabel: string
  previousScore?: number
  onSubmit: (score: number) => void
}) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(previousScore ?? 0)

  function toggle(question: ModelingQuizQuestion, option: number) {
    if (submitted) return
    setAnswers((current) => {
      const selected = current[question.id] ?? []
      if (question.correct.length === 1) return { ...current, [question.id]: [option] }
      return {
        ...current,
        [question.id]: selected.includes(option)
          ? selected.filter((value) => value !== option)
          : [...selected, option],
      }
    })
  }

  function checkAnswers() {
    const points = questions.reduce(
      (total, item) => total + (sameAnswers(answers[item.id] ?? [], item.correct) ? 1 : 0),
      0
    )
    const percent = Math.round((points / questions.length) * 100)
    setScore(percent)
    setSubmitted(true)
    onSubmit(percent)
  }

  const allAnswered = questions.every((item) => (answers[item.id] ?? []).length > 0)

  return (
    <section className="not-prose relative mt-12 overflow-hidden rounded-[30px] border border-amber-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,.96),rgba(255,251,235,.93),rgba(236,253,245,.9))] shadow-[0_28px_90px_-48px_rgba(41,63,50,0.55)] backdrop-blur-xl dark:border-amber-300/15 dark:bg-[linear-gradient(145deg,rgba(16,26,23,.96),rgba(31,27,17,.92),rgba(11,35,28,.9))]">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_15%_12%,rgba(245,158,11,.16),transparent_24%),radial-gradient(circle_at_88%_86%,rgba(16,185,129,.14),transparent_28%)]" />
      <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-100/85 via-white to-emerald-50/80 px-5 py-5 dark:border-amber-300/15 dark:from-amber-300/10 dark:via-white/[0.03] dark:to-emerald-300/10 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
              <CircleHelp className="h-4 w-4" /> {questions.length} {language === 'zh' ? '道题' : 'questions'}
            </div>
            <h2 className="text-xl font-black tracking-tight text-[#18231e] dark:text-white sm:text-2xl">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5c6c63] dark:text-white/60">{description}</p>
          </div>
          {(submitted || previousScore !== undefined) && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{score}%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-200/60">{language === 'zh' ? '得分' : 'score'}</div>
            </div>
          )}
        </div>
      </div>

      <div className="relative space-y-7 p-5 sm:p-7">
        {questions.map((item, questionIndex) => {
          const selected = answers[item.id] ?? []
          const isCorrect = submitted && sameAnswers(selected, item.correct)
          return (
            <fieldset key={item.id} className="space-y-3">
              <legend className="mb-3 flex gap-3 text-sm font-bold leading-6 text-[#223129] dark:text-white/90 sm:text-base">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#163f2c] text-xs text-white">{questionIndex + 1}</span>
                <span>{item.prompt[language]}</span>
              </legend>
              <div className="grid gap-2 pl-0 sm:pl-10">
                {item.options[language].map((option, optionIndex) => {
                  const active = selected.includes(optionIndex)
                  const correctOption = item.correct.includes(optionIndex)
                  return (
                    <button
                      key={`${item.id}-${optionIndex}`}
                      type="button"
                      onClick={() => toggle(item, optionIndex)}
                      disabled={submitted}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition',
                        !submitted && 'border-[#dce6df] bg-white/75 hover:border-emerald-400 hover:bg-emerald-50/70 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-300/40',
                        active && !submitted && 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10 dark:bg-emerald-400/10',
                        submitted && correctOption && 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-400/15 dark:text-emerald-100',
                        submitted && active && !correctOption && 'border-rose-400 bg-rose-50 text-rose-950 dark:bg-rose-400/10 dark:text-rose-100',
                        submitted && !active && !correctOption && 'border-[#e7ece8] opacity-60 dark:border-white/5'
                      )}
                    >
                      <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] font-black', item.correct.length > 1 ? 'rounded-md' : 'rounded-full', active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-[#b8c6bd]')}>{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>
              {submitted && (
                <div className={cn('ml-0 rounded-xl px-4 py-3 text-sm leading-6 sm:ml-10', isCorrect ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100' : 'bg-amber-50 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100')}>
                  <span className="font-black">{isCorrect ? (language === 'zh' ? '正确。' : 'Correct. ') : (language === 'zh' ? '再检查一下。' : 'Review this. ')}</span>
                  {item.explanation[language]}
                </div>
              )}
            </fieldset>
          )
        })}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e9e4] pt-5 dark:border-white/10">
          <p className="text-xs font-medium text-muted-foreground">
            {language === 'zh' ? '第一次作答会计入本地学习记录；登录后可在 Learning Center 汇总查看。' : 'Your first attempt is kept in your learning record and summarized in Learning Center.'}
          </p>
          {!submitted ? (
            <Button onClick={checkAnswers} disabled={!allAnswered} className="rounded-full bg-[#163f2c] px-6 text-white hover:bg-[#0f3021]">
              {submitLabel}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false) }} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> {language === 'zh' ? '重新作答' : 'Try again'}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export function ModelingLessonReader({
  locale,
  courseId,
  lessonId,
  lessonNumber,
  lessonLevel,
  courseTitle,
  lessonTitle,
  lessonDescription,
  chapters,
  nextLesson,
}: {
  locale: string
  courseId: number
  lessonId: number
  lessonNumber: number
  lessonLevel: number
  courseTitle: string
  lessonTitle: string
  lessonDescription: string | null
  chapters: { en: SerializedChapter[]; zh: SerializedChapter[] }
  nextLesson: { id: number; title: string } | null
}) {
  const [language, setLanguage] = useState<ReaderLanguage>(locale.toLowerCase().startsWith('zh') ? 'zh' : 'en')
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState<StoredProgress>(emptyProgress)
  const [saved, setSaved] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackState, setFeedbackState] = useState<'idle' | 'sending' | 'sent' | 'login' | 'error'>('idle')
  const supabase = useMemo(() => createClient(), [])

  const localized = language === 'zh' && chapters.zh.length > 0 ? chapters.zh : chapters.en
  const finalIndex = localized.length
  const isFinalQuiz = activeIndex >= finalIndex
  const activeChapter = localized[Math.min(activeIndex, Math.max(0, localized.length - 1))]
  const progressKey = `modeling-learning-progress:${lessonId}`
  const bookmarkKey = 'modeling-learning-bookmarks'
  const itemId = isFinalQuiz ? 'final-quiz' : `chapter-${activeIndex + 1}`
  const checkpointQuestions = useMemo(() => {
    const chapterQuestions = chapters.en.map((chapter) => chapter.quiz)
    // Interleave by difficulty instead of exhausting early chapters first.
    // Question 0 checks the chapter's central idea; question 4 is the mapped
    // calculation whenever that chapter introduces a mathematical method.
    const conceptPass = chapterQuestions.map((items) => items[0]).filter(Boolean)
    const calculationPass = chapterQuestions.map((items) => items[4]).filter(Boolean)
    const transferPass = chapterQuestions.flatMap((items) => items.slice(1, 4))
    return [...conceptPass, ...calculationPass, ...transferPass].slice(0, 15)
  }, [chapters.en])
  const questions = useMemo(
    () => isFinalQuiz ? checkpointQuestions : (chapters.en[activeIndex]?.quiz ?? activeChapter.quiz),
    [activeChapter.quiz, activeIndex, chapters.en, checkpointQuestions, isFinalQuiz]
  )
  const totalUnits = localized.length + 1
  const completedCount = progress.completed.filter((id) => id === 'final-quiz' || /^chapter-\d+$/.test(id)).length
  const percent = Math.round((completedCount / Math.max(1, totalUnits)) * 100)

  useEffect(() => {
    function loadStoredState() {
      try {
        const chapterParam = new URLSearchParams(window.location.search).get('chapter')
        if (chapterParam === 'final') setActiveIndex(finalIndex)
        else if (chapterParam) {
          const requested = Number(chapterParam) - 1
          if (Number.isInteger(requested) && requested >= 0 && requested < finalIndex) setActiveIndex(requested)
        }
        const stored = localStorage.getItem(progressKey)
        if (stored) setProgress({ ...emptyProgress, ...JSON.parse(stored) })
        const bookmarks = JSON.parse(localStorage.getItem(bookmarkKey) ?? '[]') as SavedChapter[]
        setSaved(bookmarks.some((item) => item.id === `${lessonId}:${itemId}`))
      } catch {
        setProgress(emptyProgress)
      }
    }
    queueMicrotask(loadStoredState)
  }, [finalIndex, itemId, lessonId, progressKey])

  useEffect(() => {
    async function hydrateCloudState() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const { data } = await supabase
        .from('user_ui_state')
        .select('value')
        .eq('user_id', session.user.id)
        .eq('key', cloudStateKey)
        .maybeSingle()
      const cloud = data?.value as unknown as CloudLearningState | null
      if (!cloud) return
      const lessonProgress = cloud.progress?.[String(lessonId)]
      if (lessonProgress) {
        setProgress(lessonProgress)
        localStorage.setItem(progressKey, JSON.stringify(lessonProgress))
      }
      if (Array.isArray(cloud.bookmarks)) {
        localStorage.setItem(bookmarkKey, JSON.stringify(cloud.bookmarks))
        setSaved(cloud.bookmarks.some((item) => item.id === `${lessonId}:${itemId}`))
      }
    }
    void hydrateCloudState()
  }, [bookmarkKey, itemId, lessonId, progressKey, supabase])

  async function persistCloud(nextProgress?: StoredProgress, nextBookmarks?: SavedChapter[]) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { data } = await supabase
      .from('user_ui_state')
      .select('value')
      .eq('user_id', session.user.id)
      .eq('key', cloudStateKey)
      .maybeSingle()
    const current = (data?.value as unknown as CloudLearningState | null) ?? { progress: {}, bookmarks: [] }
    const payload: CloudLearningState = {
      progress: nextProgress ? { ...current.progress, [String(lessonId)]: nextProgress } : current.progress,
      bookmarks: nextBookmarks ?? current.bookmarks,
      practiceHistory: current.practiceHistory ?? [],
    }
    await supabase.from('user_ui_state').upsert({
      user_id: session.user.id,
      key: cloudStateKey,
      value: JSON.parse(JSON.stringify(payload)),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' })
  }

  function recordScore(score: number) {
    setProgress((current) => {
      const firstCompletion = !current.completed.includes(itemId)
      const next = {
        completed: firstCompletion ? [...current.completed, itemId] : current.completed,
        scores: { ...current.scores, [itemId]: score },
        xp: current.xp + (firstCompletion ? Math.round((score / 100) * questions.length) : 0),
        lastStudiedAt: new Date().toISOString(),
      }
      localStorage.setItem(progressKey, JSON.stringify(next))
      void persistCloud(next)
      return next
    })
  }

  function toggleBookmark() {
    if (isFinalQuiz || !activeChapter) return
    const id = `${lessonId}:${itemId}`
    const current = JSON.parse(localStorage.getItem(bookmarkKey) ?? '[]') as SavedChapter[]
    const exists = current.some((item) => item.id === id)
    const next = exists
      ? current.filter((item) => item.id !== id)
      : [{
          id,
          lessonId,
          lessonTitle,
          chapterId: itemId,
          chapterTitle: activeChapter.title,
          courseTitle,
          href: `${window.location.pathname}?chapter=${activeIndex + 1}`,
          savedAt: new Date().toISOString(),
        }, ...current]
    localStorage.setItem(bookmarkKey, JSON.stringify(next))
    void persistCloud(undefined, next)
    setSaved(!exists)
  }

  function navigate(index: number) {
    const nextIndex = Math.max(0, Math.min(index, finalIndex))
    setActiveIndex(nextIndex)
    const url = new URL(window.location.href)
    url.searchParams.set('chapter', nextIndex >= finalIndex ? 'final' : String(nextIndex + 1))
    window.history.replaceState({}, '', url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitFeedback() {
    if (!activeChapter || !feedbackMessage.trim()) return
    setFeedbackState('sending')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setFeedbackState('login')
      return
    }
    const response = await fetch('/api/modeling/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId,
        lessonTitle,
        chapterId: itemId,
        chapterTitle: activeChapter.title,
        message: feedbackMessage.trim(),
      }),
    })
    if (!response.ok) {
      setFeedbackState('error')
      return
    }
    setFeedbackMessage('')
    setFeedbackState('sent')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f4f1e8] pt-16 text-[#18231e] dark:bg-[#08110e] dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.09] saturate-75 dark:opacity-[0.07]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#f8f6ef]/90 via-[#f4f1e8]/94 to-[#edf3ed]/95 dark:from-[#08110e]/90 dark:via-[#08110e]/94 dark:to-[#0d1713]/96" />

      <div className="sticky top-16 z-30 border-b border-white/20 bg-[#09131f]/95 text-white shadow-xl backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black shadow-lg', modelingLevelIconClasses(lessonLevel))}>{String(lessonNumber).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em]', modelingLevelBadgeClasses(lessonLevel))}>{language === 'zh' ? `级别 ${lessonLevel}` : `Level ${lessonLevel}`}</span>
                  <h1 className={cn('truncate text-base font-black sm:text-xl', modelingLevelTitleClasses(lessonLevel))}>{lessonTitle}</h1>
                </div>
              </div>
              <p className="mt-1 text-xs text-white/45">{courseTitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white/65">{completedCount}/{totalUnits} done</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-amber-300">{percent}%</span>
            </div>
          </div>
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <div className="flex min-w-max items-start px-5 pb-3 pt-2 sm:px-7">
              {[...localized.map((chapter) => chapter.title), language === 'zh' ? '综合检查' : 'Checkpoint Quiz'].map((title, index) => {
                const id = index === finalIndex ? 'final-quiz' : `chapter-${index + 1}`
                const complete = progress.completed.includes(id)
                const active = index === activeIndex
                return (
                  <div key={`${id}-${title}`} className="flex items-start">
                    <button
                      type="button"
                      onClick={(event) => {
                        navigate(index)
                        event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                      }}
                      className="group flex min-h-[62px] w-[96px] scroll-mx-5 flex-col items-center gap-1.5 text-center sm:w-[112px] sm:scroll-mx-7"
                    >
                      <span className={cn('flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black transition', complete && 'border-[#2366ad] bg-[#2366ad] text-white', active && 'ring-2 ring-sky-300 ring-offset-[3px] ring-offset-[#09131f]', !complete && !active && 'border-white/20 bg-white/5 text-white/45 group-hover:border-sky-300/60')}>
                        {complete ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <span className={cn('w-full truncate px-1 text-[11px] font-semibold sm:text-xs', active ? 'text-white' : 'text-white/55')}>{title}</span>
                    </button>
                    {index < finalIndex && <span className={cn('mt-[17px] h-[3px] w-5 rounded-full sm:w-8', complete ? 'bg-[#2366ad]' : 'bg-white/15')} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-7 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${locale}/courses/${courseId}`} prefetch className="inline-flex items-center gap-2 text-sm font-bold text-[#315d49] hover:text-[#163f2c] dark:text-emerald-300">
            <ArrowLeft className="h-4 w-4" /> {language === 'zh' ? '返回课程大纲' : 'Back to syllabus'}
          </Link>
          <div className="flex items-center gap-2">
            {chapters.zh.length > 0 && (
              <div className="flex rounded-full border border-[#cbd8cf] bg-white/75 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                {(['en', 'zh'] as const).map((item) => (
                  <button key={item} onClick={() => { setLanguage(item); setActiveIndex(0) }} className={cn('rounded-full px-3 py-1.5 text-xs font-black transition', language === item ? 'bg-[#163f2c] text-white' : 'text-muted-foreground hover:text-foreground')}>
                    {item === 'en' ? 'English' : '中文'}
                  </button>
                ))}
              </div>
            )}
            {!isFinalQuiz && (
              <Button variant="outline" size="sm" onClick={toggleBookmark} className="rounded-full border-[#cbd8cf] bg-white/75 backdrop-blur dark:border-white/10 dark:bg-white/5">
                {saved ? <BookmarkCheck className="mr-2 h-4 w-4 text-amber-600" /> : <Bookmark className="mr-2 h-4 w-4" />}
                {saved ? (language === 'zh' ? '已收藏' : 'Saved') : (language === 'zh' ? '收藏本章' : 'Save chapter')}
              </Button>
            )}
            {!isFinalQuiz && <Button variant="outline" size="sm" onClick={() => { setFeedbackOpen((value) => !value); setFeedbackState('idle') }} className="rounded-full border-[#cbd8cf] bg-white/75 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <MessageSquareText className="mr-2 h-4 w-4" /> {language === 'zh' ? '提出建议' : 'Suggest an improvement'}
            </Button>}
          </div>
        </div>

        {feedbackOpen && !isFinalQuiz && <section className="mb-6 rounded-2xl border border-indigo-200/80 bg-white/85 p-4 shadow-lg backdrop-blur dark:border-indigo-300/15 dark:bg-white/[0.05]">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{language === 'zh' ? '向作者提出建议' : 'Suggest an improvement'}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{language === 'zh' ? `建议会关联到“${activeChapter?.title}”，开发者可以在开发者中心查看并标记是否采纳。` : `Your suggestion will be attached to “${activeChapter?.title}”. The developer can review it and mark it as adopted.`}</p></div></div>
          <textarea value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} maxLength={4000} placeholder={language === 'zh' ? '请说明哪里不清楚、哪里可能有错误，或你希望补充什么内容……' : 'Tell me what is unclear, possibly incorrect, or worth adding…'} className="mt-3 min-h-28 w-full resize-y rounded-xl border border-indigo-200 bg-white/80 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-black/20" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{feedbackState === 'sent' ? (language === 'zh' ? '建议已提交，谢谢。' : 'Suggestion sent—thank you.') : feedbackState === 'login' ? (language === 'zh' ? '请先登录后再提交建议。' : 'Please sign in before sending feedback.') : feedbackState === 'error' ? (language === 'zh' ? '提交失败，请稍后再试。' : 'Could not send the suggestion. Please try again.') : `${feedbackMessage.length}/4000`}</p><Button onClick={() => { void submitFeedback() }} disabled={!feedbackMessage.trim() || feedbackState === 'sending'} className="rounded-full bg-indigo-700 px-5 text-white hover:bg-indigo-600"><Send className="mr-2 h-4 w-4" /> {feedbackState === 'sending' ? (language === 'zh' ? '提交中…' : 'Sending…') : (language === 'zh' ? '提交建议' : 'Send suggestion')}</Button></div>
        </section>}

        {!isFinalQuiz && activeChapter ? (
          <article className="modeling-article-surface relative overflow-hidden rounded-[34px] border border-white/90 bg-[linear-gradient(150deg,rgba(255,255,255,.91),rgba(247,250,245,.86),rgba(239,247,242,.82))] p-5 shadow-[0_35px_100px_-55px_rgba(30,55,42,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(150deg,rgba(13,23,19,.92),rgba(12,29,23,.88),rgba(15,25,31,.86))] sm:p-9 lg:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_8%_0%,rgba(251,191,36,.12),transparent_24%),radial-gradient(circle_at_96%_12%,rgba(52,211,153,.12),transparent_25%),linear-gradient(rgba(28,89,63,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(28,89,63,.035)_1px,transparent_1px)] [background-size:auto,auto,32px_32px,32px_32px] dark:opacity-35" />
            <div className="relative z-10">
            <header className="mb-10 border-b border-[#dfe8e1] pb-8 dark:border-white/10">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#dbe8df] px-3 py-1 text-xs font-black uppercase tracking-widest text-[#315d49] dark:bg-emerald-400/10 dark:text-emerald-300">{language === 'zh' ? '核心概念' : 'Core concept'}</span>
                <span className="rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-xs font-bold text-sky-800 dark:border-sky-300/15 dark:bg-sky-300/10 dark:text-sky-200">{language === 'zh' ? '零基础友好' : 'No prerequisites assumed'}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-300/10 dark:text-amber-300">{language === 'zh' ? `第 ${activeIndex + 1} 章，共 ${localized.length} 章` : `Unit ${activeIndex + 1} of ${localized.length}`}</span>
                {progress.completed.includes(itemId) && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">{language === 'zh' ? '已完成' : 'Completed'}</span>}
              </div>
              <h2 className="text-3xl font-black tracking-[-0.035em] text-[#17231d] dark:text-white sm:text-4xl">{activeChapter.title}</h2>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock3 className="h-4 w-4" /> {Math.max(8, Math.round(45 / Math.max(1, localized.length)) + 8)} min
              </div>
              {activeIndex === 0 && lessonDescription && <p className="mt-6 max-w-3xl text-base leading-7 text-[#526259] dark:text-white/60">{lessonDescription}</p>}
              <div className="mt-6 rounded-2xl border border-[#d8e7dc] bg-white/55 px-4 py-3 text-sm leading-6 text-[#4d6257] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.035] dark:text-white/65">
                {language === 'zh'
                  ? '你不需要预先认识本章的算法或符号。先跟着问题与直觉走；每个新概念都会先说明“它在解决什么”，再给定义、推导、算例与验证方法。'
                  : 'You are not expected to know this chapter’s algorithm or notation in advance. We begin with the problem and intuition, then introduce each definition, derivation, worked calculation, and validation step.'}
              </div>
            </header>
            <LessonContent mdx={activeChapter.mdx} videoUrl={null} embedCode={null} embedMode="sandboxed" />
            </div>
          </article>
        ) : (
          <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 text-center shadow-[0_35px_100px_-55px_rgba(30,55,42,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/88 sm:p-10">
            <Trophy className="mx-auto h-12 w-12 text-amber-500" />
            <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">{language === 'zh' ? '本篇测验' : 'Blog assessment'}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{language === 'zh' ? '综合检查' : 'Checkpoint Quiz'}</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-muted-foreground">{language === 'zh' ? '15 道题覆盖整篇 Blog 的核心概念、计算与模型判断。题目由易到难，后续可以继续由作者审核和迭代。' : 'Fifteen questions connect the whole blog: concepts, calculations, and modeling judgment. They progress from foundations to deeper transfer.'}</p>
          </section>
        )}

        <ModelingQuiz
          key={`${language}-${itemId}`}
          questions={questions}
          language={language}
          title={isFinalQuiz ? (language === 'zh' ? '本讲综合检查' : 'Checkpoint Quiz') : (language === 'zh' ? '章节练习' : 'Chapter Checkpoint')}
          description={isFinalQuiz ? (language === 'zh' ? '完成全部 15 道题，检查你是否能够把各章节连接成完整的建模思路。' : 'Complete all 15 questions to test whether you can connect the chapters into one modeling argument.') : (language === 'zh' ? '5 道题不只检查记忆，还要求计算、判断假设并解释模型。' : 'Five questions test calculation, assumptions, and model judgment—not just recall.')}
          submitLabel={language === 'zh' ? '检查答案' : 'Check answers'}
          previousScore={progress.scores[itemId]}
          onSubmit={recordScore}
        />

        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => navigate(activeIndex - 1)} disabled={activeIndex === 0} className="rounded-full bg-white/75 dark:bg-white/5">
            <ChevronLeft className="mr-2 h-4 w-4" /> {language === 'zh' ? '上一章' : 'Previous'}
          </Button>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-amber-500" /> {language === 'zh' ? `本篇已获得 ${progress.xp} 点经验` : `${progress.xp} XP earned in this blog`}
          </div>
          {activeIndex < finalIndex ? (
            <Button onClick={() => navigate(activeIndex + 1)} className="rounded-full bg-[#163f2c] px-6 text-white hover:bg-[#0f3021]">
              {language === 'zh' ? '下一章' : 'Next chapter'} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : nextLesson ? (
            <Link href={`/${locale}/courses/${courseId}/lessons/${nextLesson.id}`} prefetch>
              <Button className="rounded-full bg-[#163f2c] px-6 text-white hover:bg-[#0f3021]">
                {language === 'zh' ? '下一篇 Blog' : 'Next blog'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/${locale}/learning-center`} prefetch>
              <Button className="rounded-full bg-[#163f2c] px-6 text-white hover:bg-[#0f3021]">
                {language === 'zh' ? '打开学习中心' : 'Open Learning Center'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}
