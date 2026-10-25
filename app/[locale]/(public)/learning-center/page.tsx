import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentTenantId, getCurrentUserId } from '@/lib/supabase/tenant'
import { ModelingLearningCenter } from '@/components/modeling/modeling-learning-center'
import { extractLessonChapters } from '@/lib/modeling/lesson-chapters'
import type { Metadata } from 'next'
import modelingManifest from '@/content/mathematical-modeling/manifest.json'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isChinese = locale.toLowerCase().startsWith('zh')
  return {
    title: isChinese ? '学习中心 — 数学建模' : 'Learning Center — Mathematical Modeling',
    description: isChinese
      ? '查看数学建模课程的学习进度、记忆保持度、收藏、练习记录、经验值与成就。'
      : 'Review progress, retained mastery, bookmarks, practice history, XP, and achievements for the Mathematical Modeling course.',
  }
}

export default async function LearningCenterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [tenantId, userId] = await Promise.all([getCurrentTenantId(), getCurrentUserId()])
  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select('course_id')
    .eq('tenant_id', tenantId)
    .eq('title', 'Mathematical Modeling')
    .eq('status', 'published')
    .single()

  const { data: lessons } = course
    ? await admin
        .from('lessons')
        .select('id, sequence, title, content')
        .eq('tenant_id', tenantId)
        .eq('course_id', course.course_id)
        .eq('status', 'published')
        .order('sequence', { ascending: true })
    : { data: [] }

  const titleZh = new Map(modelingManifest.lessons.map((lesson) => [lesson.number, lesson.titleZh]))
  const lessonSummaries = (lessons ?? []).map((lesson) => ({
    id: lesson.id,
    sequence: lesson.sequence,
    title: lesson.title,
    titleZh: titleZh.get(lesson.sequence) ?? lesson.title,
    totalUnits: extractLessonChapters(lesson.content ?? '', lesson.title).en.length + 1,
  }))

  return <ModelingLearningCenter courseId={course?.course_id ?? 0} lessons={lessonSummaries} signedIn={Boolean(userId)} locale={locale} />
}
