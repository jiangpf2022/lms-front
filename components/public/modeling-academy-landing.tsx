import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileQuestion,
  FlaskConical,
  LockKeyhole,
  Sigma,
  Sparkles,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export interface ModelingLessonSummary {
  id: number
  sequence: number
  title: string
  description: string | null
  summary: string | null
  status: string
  is_preview: boolean
  exerciseCount: number
}

interface ModelingAcademyLandingProps {
  courseId: number
  lessons: ModelingLessonSummary[]
}

const definitions = [
  {
    term: 'Model',
    zh: '模型',
    body: 'A deliberate simplification of reality, built for a specific decision, explanation, or prediction.',
    icon: Sigma,
  },
  {
    term: 'Assumption',
    zh: '假设',
    body: 'A declared approximation that makes the model usable—and tells us when its conclusion may fail.',
    icon: BrainCircuit,
  },
  {
    term: 'Validation',
    zh: '验证',
    body: 'Evidence that the equations, code, and conclusions behave correctly for the question we actually asked.',
    icon: CheckCircle2,
  },
  {
    term: 'Sensitivity',
    zh: '敏感性',
    body: 'How a recommendation changes when inputs, assumptions, or preferences move.',
    icon: BarChart3,
  },
]

const levels = [
  {
    level: 'Level 1',
    title: 'Foundations',
    body: 'For complete beginners. Build a full modeling workflow and prepare for CUMCM provincial 2/3 or MCM/ICM Honorable Mention.',
  },
  {
    level: 'Level 2',
    title: 'Advanced Methods',
    body: 'Assumes Level 1. Strengthen modeling depth, verification, and communication for CUMCM provincial 1 or MCM/ICM Meritorious.',
  },
  {
    level: 'Level 3',
    title: 'Award-Level Work',
    body: 'Assumes Levels 1–2. Develop research-grade reasoning for CUMCM national awards or MCM/ICM Outstanding/Finalist.',
  },
]

function trackFor(sequence: number) {
  if (sequence <= 3) return 'Foundations & Evidence'
  if (sequence <= 8) return 'Optimization Models'
  if (sequence <= 18) return 'Dynamic & Data Models'
  return 'Writing & Competition'
}

export function ModelingAcademyLanding({ courseId, lessons }: ModelingAcademyLandingProps) {
  const published = lessons.filter((lesson) => lesson.status === 'published')
  const quizCount = lessons.reduce((sum, lesson) => sum + lesson.exerciseCount, 0)
  const firstLesson = published[0]

  return (
    <div className="overflow-x-clip bg-[#f7f4ed] text-[#15231d] dark:bg-[#0d1713] dark:text-[#eef8f1]">
      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-black/10 pt-16 dark:border-white/10">
        <img
          src="/mathematical-modeling/course-cover.webp"
          alt="Mathematical modeling course cover"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,22,17,.94)_0%,rgba(8,22,17,.82)_48%,rgba(8,22,17,.38)_100%)]" />
        <div className="mx-auto grid min-h-[700px] max-w-[1240px] items-center gap-14 px-6 py-20 lg:grid-cols-[1.2fr_.8fr] lg:px-10">
          <div className="max-w-3xl text-white">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Bilingual · Competition-oriented · Evidence-first
            </p>
            <h1 className={cn(display.className, 'text-[clamp(3.25rem,7vw,6.5rem)] font-extrabold leading-[.92] tracking-[-.055em]')}>
              Mathematical
              <br />
              <span className="text-amber-300">Modeling</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              From an ambiguous real-world question to a defensible model, tested algorithm, clear figure, and decision-ready conclusion.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
              从现实问题、变量与假设出发，建立可验证的模型，并把结果写成经得起追问的完整论证。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="#syllabus" className="inline-flex h-13 items-center gap-2 rounded-full bg-amber-300 px-6 font-bold text-[#14231c] transition hover:-translate-y-0.5 hover:bg-amber-200">
                Explore the syllabus <ArrowRight className="h-4 w-4" />
              </Link>
              {firstLesson && (
                <Link href={`/courses/${courseId}/lessons/${firstLesson.id}`} className="inline-flex h-13 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  Start Chapter 1 <BookOpen className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-end pb-4 lg:self-center">
            {[
              ['21', 'planned topics'],
              [String(published.length), 'public chapters'],
              [String(quizCount), 'quiz banks'],
              ['EN / 中文', 'bilingual reading'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/20 bg-black/25 p-5 text-white backdrop-blur-md">
                <div className={cn(display.className, 'text-3xl font-extrabold text-amber-300')}>{value}</div>
                <div className="mt-1 text-sm text-white/65">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-[1240px] px-6 py-24 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-700 dark:text-emerald-300">The modeling vocabulary</p>
          <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl')}>
            Learn the language before chasing the algorithm.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#526158] dark:text-white/60">
            A strong paper is not a list of methods. It is a chain of decisions: what to simplify, what to preserve, what to test, and what the evidence actually supports.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {definitions.map(({ term, zh, body, icon: Icon }, index) => (
            <article key={term} className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[.04]">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-amber-300 dark:bg-emerald-300 dark:text-emerald-950">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-black/35 dark:text-white/35">0{index + 1}</span>
              </div>
              <h3 className={cn(display.className, 'mt-8 text-2xl font-bold')}>{term} <span className="text-base font-medium text-emerald-700 dark:text-emerald-300">/ {zh}</span></h3>
              <p className="mt-3 text-sm leading-6 text-[#5d6962] dark:text-white/58">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="levels" className="border-y border-black/10 bg-[#12271e] py-24 text-white dark:border-white/10">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.22em] text-amber-300">Learning levels</p>
              <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl')}>A path with a clear destination.</h2>
              <p className="mt-5 leading-7 text-white/60">Levels describe prerequisite depth and competition ambition—not a paywall or a measure of talent.</p>
            </div>
            <div className="grid gap-3">
              {levels.map((item, index) => (
                <article key={item.level} className="grid gap-4 rounded-3xl border border-white/12 bg-white/[.055] p-6 sm:grid-cols-[92px_180px_1fr] sm:items-center">
                  <span className="text-sm font-bold text-amber-300">{item.level}</span>
                  <h3 className={cn(display.className, 'text-xl font-bold')}>{item.title}</h3>
                  <p className="text-sm leading-6 text-white/62">{item.body}</p>
                  <span className="hidden">{index}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="syllabus" className="mx-auto max-w-[1240px] scroll-mt-24 px-6 py-24 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-700 dark:text-emerald-300">Course roadmap</p>
            <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl')}>Syllabus & articles</h2>
            <p className="mt-5 text-lg leading-8 text-[#526158] dark:text-white/60">Published chapters open directly. Draft chapters remain visible so you can see where the full course is going.</p>
          </div>
          <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 font-bold text-emerald-800 hover:underline dark:text-emerald-300">
            Course center <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 overflow-hidden rounded-[30px] border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/[.035]">
          {lessons.map((lesson) => {
            const isPublished = lesson.status === 'published'
            const content = (
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:px-7">
                <span className={cn(display.className, 'flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-extrabold', isPublished ? 'bg-emerald-900 text-amber-300 dark:bg-emerald-300 dark:text-emerald-950' : 'bg-black/5 text-black/35 dark:bg-white/5 dark:text-white/30')}>
                  {String(lesson.sequence).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <span>{trackFor(lesson.sequence)}</span>
                    <span className="text-black/25 dark:text-white/25">·</span>
                    <span>{lesson.summary?.split('·')[0]?.trim() || 'Course topic'}</span>
                  </div>
                  <h3 className={cn(display.className, 'text-lg font-bold sm:text-xl')}>{lesson.title}</h3>
                  {lesson.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#657168] dark:text-white/50">{lesson.description}</p>}
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  {lesson.exerciseCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/25 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-200">
                      <FileQuestion className="h-3.5 w-3.5" /> Quiz
                    </span>
                  )}
                  {isPublished ? <ArrowRight className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> : <LockKeyhole className="h-4 w-4 text-black/30 dark:text-white/30" />}
                </div>
              </div>
            )

            return isPublished ? (
              <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`} className="block border-b border-black/8 transition hover:bg-amber-200/20 last:border-0 dark:border-white/8 dark:hover:bg-white/[.045]">
                {content}
              </Link>
            ) : (
              <div key={lesson.id} className="border-b border-black/8 opacity-70 last:border-0 dark:border-white/8">{content}</div>
            )
          })}
        </div>
      </section>

      <section id="quizzes" className="mx-auto max-w-[1240px] px-6 pb-24 lg:px-10">
        <div className="grid overflow-hidden rounded-[36px] bg-amber-300 text-[#15231d] lg:grid-cols-[1fr_.8fr]">
          <div className="p-8 sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.22em]">Knowledge checks</p>
            <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl')}>Reading is only the first pass.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#3e4c45]">Each released quiz moves from recognition to mathematical reasoning. Sign in to save attempts, course progress, and first-try results in My Learning.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/courses/${courseId}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#15231d] px-6 font-bold text-white hover:bg-[#244035]">
                Open course & quizzes <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/login" className="inline-flex h-12 items-center rounded-full border border-[#15231d]/30 px-6 font-bold hover:bg-white/30">Sign in</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[#15231d]/15 p-px">
            {[
              [Target, 'Progressive difficulty', 'From core ideas to competition-level reasoning'],
              [FileQuestion, `${quizCount} quiz banks`, 'Attached to the relevant chapters'],
              [Clock3, 'Saved attempts', 'Return later without losing your place'],
              [FlaskConical, 'Model-based questions', 'Calculations, assumptions, and diagnostics'],
            ].map(([Icon, title, body]) => {
              const QuizIcon = Icon as typeof Target
              return (
                <div key={String(title)} className="bg-amber-200 p-6 sm:p-8">
                  <QuizIcon className="h-6 w-6" />
                  <div className={cn(display.className, 'mt-6 text-xl font-bold')}>{String(title)}</div>
                  <p className="mt-2 text-sm leading-6 text-[#526158]">{String(body)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
