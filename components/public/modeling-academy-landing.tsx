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
  Sigma,
  Sparkles,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  modelingLevelDotClasses,
  modelingLevelIconClasses,
  modelingLevelPanelClasses,
  modelingLevelTextClasses,
  modelingLevelTitleClasses,
} from '@/lib/modeling/level-styles'
import type { ModelingVisibility } from '@/lib/modeling/developer-settings'

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
  level: number
  exerciseCount: number
  visibility: ModelingVisibility
  titleZh?: string
  descriptionZh?: string
}

interface ModelingAcademyLandingProps {
  locale: string
  courseId: number
  lessons: ModelingLessonSummary[]
}

const definitions = [
  {
    term: 'Model',
    zh: '模型',
    body: 'A deliberate simplification of reality, built for a specific decision, explanation, or prediction.',
    bodyZh: '为了特定决策、解释或预测而对现实进行的有目的简化。',
    icon: Sigma,
  },
  {
    term: 'Assumption',
    zh: '假设',
    body: 'A declared approximation that makes the model usable—and tells us when its conclusion may fail.',
    bodyZh: '明确写出的受控近似；它让模型能够使用，也说明结论可能在什么情况下失效。',
    icon: BrainCircuit,
  },
  {
    term: 'Validation',
    zh: '验证',
    body: 'Evidence that the equations, code, and conclusions behave correctly for the question we actually asked.',
    bodyZh: '用证据检查方程、代码和结论是否真正回答了我们提出的问题。',
    icon: CheckCircle2,
  },
  {
    term: 'Sensitivity',
    zh: '敏感性',
    body: 'How a recommendation changes when inputs, assumptions, or preferences move.',
    bodyZh: '当输入、假设或偏好发生变化时，模型建议会如何改变。',
    icon: BarChart3,
  },
]

const levels = [
  {
    value: 1,
    level: 'Level 1',
    title: 'Foundations',
    titleZh: '基础课程',
    body: 'For complete beginners. Build a full modeling workflow and prepare for CUMCM provincial 2/3 or MCM/ICM Honorable Mention.',
    bodyZh: '为完全零基础的参赛者准备。建立完整建模流程，目标为国赛省二/省三或美赛 H 奖。',
  },
  {
    value: 2,
    level: 'Level 2',
    title: 'Advanced Methods',
    titleZh: '进阶方法',
    body: 'Assumes Level 1. Strengthen modeling depth, verification, and communication for CUMCM provincial 1 or MCM/ICM Meritorious.',
    bodyZh: '要求掌握 Level 1。加强模型深度、验证与表达，目标为国赛省一或美赛 M 奖。',
  },
  {
    value: 3,
    level: 'Level 3',
    title: 'Award-Level Work',
    titleZh: '高阶专题',
    body: 'Assumes Levels 1–2. Develop research-grade reasoning for CUMCM national awards or MCM/ICM Outstanding/Finalist.',
    bodyZh: '要求掌握 Level 1–2。训练研究式推理，目标为国赛国家奖或美赛 O/F 奖。',
  },
]

export function ModelingAcademyLanding({ locale, courseId, lessons }: ModelingAcademyLandingProps) {
  const isChinese = locale.toLowerCase().startsWith('zh')
  const t = (english: string, chinese: string) => isChinese ? chinese : english
  const visibleLessons = lessons.filter((lesson) => lesson.visibility !== 'hidden')
  const published = visibleLessons.filter((lesson) => lesson.visibility === 'public')
  const quizCount = visibleLessons.reduce((sum, lesson) => sum + lesson.exerciseCount, 0)
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
              {t('Bilingual · Competition-oriented · Evidence-first', '中英双语 · 面向竞赛 · 证据优先')}
            </p>
            <h1 className={cn(display.className, 'text-[clamp(3.25rem,7vw,6.5rem)] font-extrabold leading-[.92] tracking-[-.055em]')}>
              {isChinese ? '数学建模' : <>Mathematical<br /><span className="text-amber-300">Modeling</span></>}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              {t('From an ambiguous real-world question to a defensible model, tested algorithm, clear figure, and decision-ready conclusion.', '从模糊的现实问题出发，建立可辩护的模型、经过检验的算法、清晰的图表与可以支持决策的结论。')}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
              {t('Learn to connect variables, assumptions, evidence, and communication into one reproducible argument.', '把变量、假设、证据与表达连接成一条可复查、可复现的完整论证。')}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="#syllabus" className="inline-flex h-13 items-center gap-2 rounded-full bg-amber-300 px-6 font-bold text-[#14231c] transition hover:-translate-y-0.5 hover:bg-amber-200">
                {t('Explore the syllabus', '浏览课程大纲')} <ArrowRight className="h-4 w-4" />
              </Link>
              {firstLesson && (
                <Link href={`/${locale}/courses/${courseId}/lessons/${firstLesson.id}`} prefetch className="inline-flex h-13 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  {t('Start Chapter 1', '开始第一章')} <BookOpen className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-end pb-4 lg:self-center">
            {[
              ['21', t('planned topics', '规划主题')],
              [String(published.length), t('public blogs', '已公开博客')],
              [String(quizCount), t('quiz banks', '测验题库')],
              [t('EN / 中文', '中文 / EN'), t('bilingual reading', '双语阅读')],
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
          <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-700 dark:text-emerald-300">{t('The modeling vocabulary', '建模的基本语言')}</p>
          <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl')}>
            {t('Learn the language before chasing the algorithm.', '先学会建模语言，再追求算法。')}
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#526158] dark:text-white/60">
            {t('A strong paper is not a list of methods. It is a chain of decisions: what to simplify, what to preserve, what to test, and what the evidence actually supports.', '一篇有说服力的论文不是方法清单，而是一条连续的决策链：简化什么、保留什么、检验什么，以及证据究竟支持到哪里。')}
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {definitions.map(({ term, zh, body, bodyZh, icon: Icon }, index) => (
            <article key={term} className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[.04]">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-amber-300 dark:bg-emerald-300 dark:text-emerald-950">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-black/35 dark:text-white/35">0{index + 1}</span>
              </div>
              <h3 className={cn(display.className, 'mt-8 text-2xl font-bold')}>{isChinese ? zh : term}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5d6962] dark:text-white/58">{isChinese ? bodyZh : body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="levels" className="border-y border-black/10 bg-[#12271e] py-24 text-white dark:border-white/10">
        <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.22em] text-amber-300">{t('Learning levels', '学习级别')}</p>
              <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl')}>{t('A path with a clear destination.', '每一级都有明确的学习目标。')}</h2>
              <p className="mt-5 leading-7 text-white/60">{t('Levels describe prerequisite depth and competition ambition—not a paywall or a measure of talent.', '级别表示前置知识与竞赛目标，不代表天赋高低，也不等同于付费门槛。')}</p>
            </div>
            <div className="grid gap-3">
              {levels.map((item) => (
                <article
                  key={item.level}
                  className={cn(
                    'grid gap-4 rounded-3xl border p-6 transition-colors sm:grid-cols-[92px_180px_1fr] sm:items-center',
                    modelingLevelPanelClasses(item.value),
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('inline-flex items-center gap-2 text-sm font-bold', modelingLevelTextClasses(item.value))}>
                      <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]', modelingLevelDotClasses(item.value))} />
                      {isChinese ? `级别 ${item.value}` : item.level}
                    </span>
                    <span className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em]',
                      item.value === 1
                        ? 'border-emerald-300/35 bg-emerald-300/12 text-emerald-200'
                        : 'border-white/15 bg-white/[.06] text-white/50',
                    )}>
                      {item.value === 1 ? t('Updating now', '正在更新') : t('In preparation', '准备中')}
                    </span>
                  </div>
                  <h3 className={cn(display.className, 'text-xl font-bold')}>{isChinese ? item.titleZh : item.title}</h3>
                  <p className="text-sm leading-6 text-white/62">{isChinese ? item.bodyZh : item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="syllabus" className="mx-auto max-w-[1240px] scroll-mt-24 px-6 py-24 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[.22em] text-emerald-700 dark:text-emerald-300">{t('Course roadmap', '课程路线')}</p>
            <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl')}>{t('Syllabus & articles', '课程大纲与文章')}</h2>
            <p className="mt-5 text-lg leading-8 text-[#526158] dark:text-white/60">{t('Public blogs open directly. Coming-soon items remain visible in gray; hidden items stay in the private course library.', '已公开文章可以直接阅读；准备公开的文章以灰色显示，完全隐藏的文章只保留在开发者课程库中。')}</p>
          </div>
          <Link href={`/${locale}/courses/${courseId}`} prefetch className="inline-flex items-center gap-2 font-bold text-emerald-800 hover:underline dark:text-emerald-300">
            {t('Course center', '课程中心')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8">
          {[1, 2, 3].map((level) => {
            const levelLessons = visibleLessons.filter((lesson) => lesson.level === level)

            return (
              <section key={level} aria-labelledby={`syllabus-level-${level}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-3">
                    <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black shadow-sm', modelingLevelIconClasses(level))}>{level}</span>
                    <div>
                      <h3 id={`syllabus-level-${level}`} className={cn(display.className, 'text-xl font-extrabold', modelingLevelTitleClasses(level))}>
                        {t(`Level ${level}`, `级别 ${level}`)}
                      </h3>
                      <p className="text-xs text-[#6b766f] dark:text-white/45">
                        {level === 1 ? t('Currently being updated', '正在更新') : t('In preparation', '准备中')}
                      </p>
                    </div>
                  </div>
                  <Link href={`/${locale}/courses/${courseId}/levels/${level}`} prefetch className={cn('inline-flex items-center gap-1.5 text-sm font-bold hover:underline', modelingLevelTextClasses(level))}>
                    {t('View this level', '查看本级别')} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[.035]">
                  <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                    <thead className="border-b border-black/10 bg-black/[.025] text-[11px] font-black uppercase tracking-[.14em] text-black/45 dark:border-white/10 dark:bg-white/[.035] dark:text-white/40">
                      <tr>
                        <th className="w-20 px-5 py-3">{t('No.', '编号')}</th>
                        <th className="px-5 py-3">{t('Blog', '文章')}</th>
                        <th className="w-36 px-5 py-3">{t('Status', '状态')}</th>
                        <th className="w-28 px-5 py-3 text-right">{t('Open', '入口')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/8 dark:divide-white/8">
                      {levelLessons.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-5 py-5 text-center text-sm text-black/40 dark:text-white/35">
                            {t('This level is in preparation. No articles are visible yet.', '本级别正在准备中，暂时没有可见文章。')}
                          </td>
                        </tr>
                      )}
                      {levelLessons.map((lesson) => {
                        const isPublished = lesson.visibility === 'public'
                        const title = isChinese ? lesson.titleZh ?? lesson.title : lesson.title
                        return (
                          <tr key={lesson.id} className={cn('transition-colors', isPublished ? 'hover:bg-black/[.025] dark:hover:bg-white/[.035]' : 'text-black/45 dark:text-white/38')}>
                            <td className="px-5 py-3 font-mono text-xs font-bold text-black/35 dark:text-white/30">{String(lesson.sequence).padStart(2, '0')}</td>
                            <td className={cn(display.className, 'px-5 py-3 font-bold', isPublished && modelingLevelTitleClasses(level))}>{title}</td>
                            <td className="px-5 py-3">
                              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', isPublished ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200' : 'bg-black/5 text-black/45 dark:bg-white/[.06] dark:text-white/40')}>
                                {isPublished ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                                {isPublished ? t('Public', '已公开') : t('Coming soon', '即将发布')}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              {isPublished ? (
                                <Link href={`/${locale}/courses/${courseId}/lessons/${lesson.id}`} prefetch className={cn('inline-flex items-center gap-1.5 font-bold hover:underline', modelingLevelTextClasses(level))}>
                                  {t('Read', '阅读')} <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              ) : <span aria-hidden="true" className="text-black/20 dark:text-white/20">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          })}
        </div>
      </section>

      <section id="quizzes" className="mx-auto max-w-[1240px] px-6 pb-24 lg:px-10">
        <div className="grid overflow-hidden rounded-[36px] bg-amber-300 text-[#15231d] lg:grid-cols-[1fr_.8fr]">
          <div className="p-8 sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[.22em]">{t('Knowledge checks', '知识检查')}</p>
            <h2 className={cn(display.className, 'mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl')}>{t('Reading is only the first pass.', '阅读只是理解的第一步。')}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#3e4c45]">{t('Each released quiz moves from recognition to mathematical reasoning. Sign in to save attempts, progress, and first-try results.', '每组测验都会从基础识别逐步走向数学推理。登录后可以保存作答、学习进度与首次得分。')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/courses/${courseId}`} prefetch className="inline-flex h-12 items-center gap-2 rounded-full bg-[#15231d] px-6 font-bold text-white hover:bg-[#244035]">
                {t('Open course & quizzes', '打开课程与测验')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/${locale}/auth/login`} prefetch className="inline-flex h-12 items-center rounded-full border border-[#15231d]/30 px-6 font-bold hover:bg-white/30">{t('Sign in', '登录')}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[#15231d]/15 p-px">
            {[
              [Target, t('Progressive difficulty', '难度逐步提升'), t('From core ideas to competition-level reasoning', '从核心概念逐步进入竞赛级推理')],
              [FileQuestion, t(`${quizCount} quiz banks`, `${quizCount} 组题库`), t('Attached to the relevant chapters', '题目与对应章节直接关联')],
              [Clock3, t('Saved attempts', '保存作答记录'), t('Return later without losing your place', '稍后返回时不会丢失进度')],
              [FlaskConical, t('Model-based questions', '基于模型的题目'), t('Calculations, assumptions, and diagnostics', '包含计算、假设判断与模型诊断')],
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
