'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpenCheck, Dice5, RefreshCcw, Sigma } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModelingQuiz, type ReaderLanguage } from '@/components/modeling/modeling-lesson-reader'
import { buildChapterQuiz, type ModelingQuizQuestion } from '@/lib/modeling/math-quiz-bank'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type PracticeLesson = {
  id: number
  number: number
  title: string
  titleZh: string
  level: number
  chapters: { title: string; titleZh: string }[]
}

type PracticeHistory = {
  id: string
  mode: 'chapter' | 'random'
  lessonNumber?: number
  chapterIndex?: number
  score: number
  questionCount: number
  completedAt: string
}

function seededShuffle<T>(items: T[], seed: number) {
  const output = [...items]
  let state = seed || 1
  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const selected = state % (index + 1)
    ;[output[index], output[selected]] = [output[selected], output[index]]
  }
  return output
}

export function PracticeCenter({ locale, lessons }: { locale: string; lessons: PracticeLesson[] }) {
  const [language, setLanguage] = useState<ReaderLanguage>(locale.toLowerCase().startsWith('zh') ? 'zh' : 'en')
  const [mode, setMode] = useState<'chapter' | 'random'>('chapter')
  const [lessonNumber, setLessonNumber] = useState(lessons[0]?.number ?? 1)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [randomCount, setRandomCount] = useState(15)
  const [attempt, setAttempt] = useState(1)
  const [latestScore, setLatestScore] = useState<number | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const lesson = lessons.find((item) => item.number === lessonNumber) ?? lessons[0]
  const chapter = lesson?.chapters[Math.min(chapterIndex, Math.max(0, lesson.chapters.length - 1))]

  const questions = useMemo(() => {
    if (!lesson) return []
    if (mode === 'chapter') {
      return buildChapterQuiz(lesson.number, chapterIndex, chapter?.title)
    }
    const pool = lessons.flatMap((item) => item.chapters.flatMap((itemChapter, index) =>
      buildChapterQuiz(item.number, index, itemChapter.title)
    ))
    const uniquePool = [...new Map(pool.map((question) => [question.prompt.en, question])).values()]
    return seededShuffle(uniquePool, attempt * 7919 + randomCount).slice(0, randomCount)
  }, [attempt, chapter?.title, chapterIndex, lesson, lessons, mode, randomCount])

  const heading = mode === 'chapter'
    ? (language === 'zh' ? `${lesson?.titleZh} · ${chapter?.titleZh}` : `${lesson?.title} · ${chapter?.title}`)
    : (language === 'zh' ? `随机综合练习 · ${randomCount} 题` : `Random mixed practice · ${randomCount} questions`)

  function record(score: number) {
    setLatestScore(score)
    try {
      const key = 'modeling-practice-history'
      const current = JSON.parse(localStorage.getItem(key) ?? '[]') as PracticeHistory[]
      const completedAt = new Date().toISOString()
      const entry: PracticeHistory = {
        id: `${completedAt}-${attempt}`,
        mode,
        lessonNumber: mode === 'chapter' ? lesson?.number : undefined,
        chapterIndex: mode === 'chapter' ? chapterIndex : undefined,
        score,
        questionCount: questions.length,
        completedAt,
      }
      const next = [entry, ...current].slice(0, 100)
      localStorage.setItem(key, JSON.stringify(next))
      void persistPracticeHistory(next)
    } catch {
      // The quiz remains usable when storage is unavailable.
    }
  }

  async function persistPracticeHistory(history: PracticeHistory[]) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const key = 'modeling-learning-center-v1'
    const { data } = await supabase.from('user_ui_state').select('value').eq('user_id', session.user.id).eq('key', key).maybeSingle()
    const current = (data?.value as Record<string, unknown> | null) ?? {}
    await supabase.from('user_ui_state').upsert({
      user_id: session.user.id,
      key,
      value: JSON.parse(JSON.stringify({ ...current, practiceHistory: history })),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,key' })
  }

  function refresh() {
    setLatestScore(null)
    setAttempt((value) => value + 1)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1e8] pt-16 text-[#18231e] dark:bg-[#08110e] dark:text-white">
      <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.08] saturate-75 dark:opacity-[0.06]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#f8f6ef]/92 via-[#f4f1e8]/95 to-[#eaf1eb]/96 dark:from-[#08110e]/92 dark:via-[#08110e]/95 dark:to-[#0d1713]/97" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-7 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">{language === 'zh' ? '集中训练' : 'Focused practice'}</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-6xl">{language === 'zh' ? '练习中心' : 'Practice Center'}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {language === 'zh' ? '按课程章节完成针对性测验，或从全部已发布课程中随机抽题。每套题同时覆盖概念判断、数学计算和模型诊断。' : 'Choose a chapter checkpoint or draw a mixed set from every published blog. Each set combines concepts, mathematical calculation, and modeling diagnosis.'}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#cad8cf] bg-white/75 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            {(['en', 'zh'] as const).map((item) => (
              <button key={item} onClick={() => setLanguage(item)} className={cn('rounded-full px-4 py-2 text-xs font-black transition', language === item ? 'bg-[#163f2c] text-white' : 'text-muted-foreground hover:text-foreground')}>
                {item === 'en' ? 'English' : '中文'}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-9 rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_30px_90px_-50px_rgba(30,55,42,.65)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1713]/88 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => { setMode('chapter'); refresh() }} className={cn('rounded-2xl border p-5 text-left transition', mode === 'chapter' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-400/10' : 'border-border hover:border-emerald-400')}>
              <BookOpenCheck className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
              <div className="mt-3 font-black">{language === 'zh' ? '章节测验' : 'Chapter checkpoint'}</div>
              <p className="mt-1 text-sm text-muted-foreground">{language === 'zh' ? '选择一篇 Blog 和一个章节，完成 5 道强关联题。' : 'Choose one blog and one chapter for five tightly related questions.'}</p>
            </button>
            <button onClick={() => { setMode('random'); refresh() }} className={cn('rounded-2xl border p-5 text-left transition', mode === 'random' ? 'border-amber-500 bg-amber-50 dark:bg-amber-400/10' : 'border-border hover:border-amber-400')}>
              <Dice5 className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              <div className="mt-3 font-black">{language === 'zh' ? '随机综合练习' : 'Random mixed practice'}</div>
              <p className="mt-1 text-sm text-muted-foreground">{language === 'zh' ? '跨课程随机抽题，适合复习与查漏补缺。' : 'Draw questions across the course for review and retrieval practice.'}</p>
            </button>
          </div>

          <div className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-[1fr_1fr_auto]">
            {mode === 'chapter' ? (
              <>
                <label className="grid gap-2 text-sm font-bold">
                  {language === 'zh' ? '选择 Blog' : 'Choose blog'}
                  <select value={lessonNumber} onChange={(event) => { setLessonNumber(Number(event.target.value)); setChapterIndex(0); refresh() }} className="h-11 rounded-xl border border-border bg-background px-3 font-medium">
                    {lessons.map((item) => <option key={item.number} value={item.number}>{String(item.number).padStart(2, '0')} · {language === 'zh' ? item.titleZh : item.title} · Level {item.level}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  {language === 'zh' ? '选择章节' : 'Choose chapter'}
                  <select value={chapterIndex} onChange={(event) => { setChapterIndex(Number(event.target.value)); refresh() }} className="h-11 rounded-xl border border-border bg-background px-3 font-medium">
                    {lesson?.chapters.map((item, index) => <option key={`${lesson.number}-${index}`} value={index}>{index + 1}. {language === 'zh' ? item.titleZh : item.title}</option>)}
                  </select>
                </label>
              </>
            ) : (
              <label className="grid gap-2 text-sm font-bold md:col-span-2">
                {language === 'zh' ? '题目数量' : 'Question count'}
                <select value={randomCount} onChange={(event) => { setRandomCount(Number(event.target.value)); refresh() }} className="h-11 rounded-xl border border-border bg-background px-3 font-medium">
                  {[10, 15, 25].map((count) => <option key={count} value={count}>{count} {language === 'zh' ? '题' : 'questions'}</option>)}
                </select>
              </label>
            )}
            <Button onClick={refresh} variant="outline" className="self-end rounded-xl bg-background">
              <RefreshCcw className="mr-2 h-4 w-4" /> {language === 'zh' ? '生成新题组' : 'New set'}
            </Button>
          </div>
        </section>

        {latestScore !== null && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
            <Sigma className="h-5 w-5" />
            <strong>{language === 'zh' ? `本次得分：${latestScore}%` : `Latest score: ${latestScore}%`}</strong>
          </div>
        )}

        <ModelingQuiz
          key={`${mode}-${lessonNumber}-${chapterIndex}-${randomCount}-${attempt}-${language}`}
          questions={questions as ModelingQuizQuestion[]}
          language={language}
          title={heading}
          description={language === 'zh' ? '先独立计算，再提交答案。提交后会显示逐题解析。' : 'Calculate independently before submitting. Explanations appear after the check.'}
          submitLabel={language === 'zh' ? '检查答案' : 'Check answers'}
          onSubmit={record}
        />

        <div className="mt-8 text-center">
          <Link href={`/${locale}/learning-center`} prefetch className="text-sm font-black text-emerald-800 hover:underline dark:text-emerald-300">
            {language === 'zh' ? '前往学习中心查看进度与遗忘曲线 →' : 'Open Learning Center for progress and review planning →'}
          </Link>
        </div>
      </main>
    </div>
  )
}
