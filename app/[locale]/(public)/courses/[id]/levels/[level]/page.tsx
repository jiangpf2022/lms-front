import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BookOpenText, Clock3, ClipboardCheck, LockKeyhole } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentTenantId } from '@/lib/supabase/tenant'
import { getModelingDeveloperSettings, modelingLevel, modelingVisibility } from '@/lib/modeling/developer-settings'
import { modelingLevelBadgeClasses, modelingLevelIconClasses, modelingLevelRowClasses, modelingLevelTitleClasses } from '@/lib/modeling/level-styles'
import { cn } from '@/lib/utils'
import modelingManifest from '@/content/mathematical-modeling/manifest.json'
import { MODELING_DESCRIPTIONS_ZH } from '@/lib/modeling/copy'

export const dynamic = 'force-dynamic'

const levelCopy = {
  1: {
    en: ['Level 1 · Foundations', 'A complete starting path for first-time competitors: modeling language, visual evidence, core optimization, dynamics, data, evaluation, and writing.'],
    zh: ['Level 1 · 基础课程', '为零基础参赛者准备的完整起点：从建模语言与视觉证据，逐步进入核心优化、动态模型、数据处理、综合评价与写作。'],
  },
  2: {
    en: ['Level 2 · Advanced Methods', 'Method-focused articles that assume Level 1 and develop deeper mathematical structure, implementation choices, and stronger validation.'],
    zh: ['Level 2 · 进阶方法', '默认已经掌握 Level 1，进一步学习更深入的数学结构、实现选择与更严格的验证。'],
  },
  3: {
    en: ['Level 3 · Award-Level Work', 'Advanced competition cases and research-style reasoning for readers targeting national or Outstanding/Finalist-level work.'],
    zh: ['Level 3 · 高阶专题', '面向高级奖项的竞赛案例与研究式推理，适合冲刺国赛国家奖或美赛 O/F 奖的读者。'],
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ level: string; locale: string }> }): Promise<Metadata> {
  const { level, locale } = await params
  const value = Number(level) as 1 | 2 | 3
  if (![1, 2, 3].includes(value)) return {}
  const copy = locale.toLowerCase().startsWith('zh') ? levelCopy[value].zh : levelCopy[value].en
  return { title: `${copy[0]} — Mathematical Modeling`, description: copy[1] }
}

export default async function ModelingLevelPage({ params }: { params: Promise<{ id: string; level: string; locale: string }> }) {
  const { id, level, locale } = await params
  const levelNumber = Number(level) as 1 | 2 | 3
  if (![1, 2, 3].includes(levelNumber)) notFound()
  const tenantId = await getCurrentTenantId()
  const admin = createAdminClient()
  const [{ data: course }, settings] = await Promise.all([
    admin.from('courses').select('course_id,title').eq('course_id', Number(id)).eq('tenant_id', tenantId).eq('title', 'Mathematical Modeling').maybeSingle(),
    getModelingDeveloperSettings(),
  ])
  if (!course) notFound()
  const { data: rows } = await admin.from('lessons').select('id,sequence,title,description,status').eq('course_id', course.course_id).eq('tenant_id', tenantId).order('sequence')
  const meta = new Map(modelingManifest.lessons.map((item) => [item.number, item]))
  const lessons = (rows ?? []).flatMap((row) => {
    const item = meta.get(row.sequence)
    if (!item || modelingLevel(row.sequence, item.level, settings) !== levelNumber) return []
    const visibility = modelingVisibility(row.sequence, row.status, settings)
    if (visibility === 'hidden') return []
    return [{ ...row, ...item, visibility }]
  })
  const isChinese = locale.toLowerCase().startsWith('zh')
  const copy = isChinese ? levelCopy[levelNumber].zh : levelCopy[levelNumber].en

  return <div className="relative min-h-screen bg-[#f4f1e8] pt-16 text-[#18231e] dark:bg-[#08110e] dark:text-white">
    <div className="pointer-events-none fixed inset-0 bg-[url('/mathematical-modeling/course-cover.webp')] bg-cover bg-center opacity-[0.075] dark:opacity-[0.05]" />
    <main className="relative mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:py-16">
      <nav className="flex flex-wrap gap-2">
        {[1, 2, 3].map((item) => <Link key={item} href={`/${locale}/courses/${id}/levels/${item}`} className={cn('rounded-full border px-4 py-2 text-xs font-black', item === levelNumber ? modelingLevelBadgeClasses(item) : 'border-border bg-background/70 text-muted-foreground')}>{isChinese ? `级别 ${item}` : `Level ${item}`}</Link>)}
      </nav>
      <header className="mt-8 max-w-4xl"><span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black', modelingLevelBadgeClasses(levelNumber))}>{isChinese ? `级别 ${levelNumber}` : `Level ${levelNumber}`}</span><h1 className={cn('mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl', modelingLevelTitleClasses(levelNumber))}>{copy[0]}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{copy[1]}</p></header>
      <section className="mt-10 grid gap-4">
        {lessons.map((lesson) => {
          const publicLesson = lesson.visibility === 'public'
          const card = <article className={cn('grid gap-5 rounded-[26px] border border-border bg-white/80 p-5 shadow-sm backdrop-blur transition dark:bg-white/[0.045] sm:grid-cols-[64px_1fr_auto] sm:items-center', modelingLevelRowClasses(levelNumber), !publicLesson && 'grayscale opacity-70')}>
            <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl border text-lg font-black shadow-lg', modelingLevelIconClasses(levelNumber))}>{String(lesson.sequence).padStart(2, '0')}</span>
            <div><h2 className={cn('text-xl font-black', modelingLevelTitleClasses(levelNumber))}>{isChinese ? lesson.titleZh : lesson.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{isChinese ? MODELING_DESCRIPTIONS_ZH[lesson.sequence] : (lesson.description || lesson.excerpt)}</p></div>
            {publicLesson ? <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link href={`/${locale}/courses/${id}/lessons/${lesson.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#163f2c] px-4 py-2 text-xs font-black text-white transition hover:bg-[#0f3021]"><BookOpenText className="h-4 w-4" /> {isChinese ? '阅读文章' : 'Read blog'}</Link>
              <Link href={`/${locale}/courses/${id}/lessons/${lesson.id}?chapter=final`} className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black text-amber-900 transition hover:bg-amber-100 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-200"><ClipboardCheck className="h-4 w-4" /> {isChinese ? '综合测验' : 'Checkpoint Quiz'}</Link>
            </div> : <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-800 dark:bg-amber-300/10 dark:text-amber-200"><Clock3 className="h-4 w-4" /> {isChinese ? '即将发布' : 'Coming soon'}</span>}
          </article>
          return <div key={lesson.sequence}>{card}</div>
        })}
        {lessons.length === 0 && <div className="rounded-[26px] border border-dashed border-border bg-background/60 p-12 text-center text-muted-foreground"><LockKeyhole className="mx-auto mb-4 h-8 w-8" />{isChinese ? '这个级别的课程仍在课程库中准备，暂时没有公开内容。' : 'This level is still being prepared in the course library; no items are public yet.'}</div>}
      </section>
    </main>
  </div>
}
