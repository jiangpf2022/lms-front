import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentTenantId, getCurrentUserId } from '@/lib/supabase/tenant'
import { ModelingLearningCenter } from '@/components/modeling/modeling-learning-center'
import { extractLessonChapters } from '@/lib/modeling/lesson-chapters'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Learning Center — Mathematical Modeling',
  description: 'Review progress, retained mastery, bookmarks, XP, and achievements for the Mathematical Modeling course.',
}

export default async function LearningCenterPage() {
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

  const lessonSummaries = (lessons ?? []).map((lesson) => ({
    id: lesson.id,
    sequence: lesson.sequence,
    title: lesson.title,
    totalUnits: extractLessonChapters(lesson.content ?? '', lesson.title).en.length + 1,
  }))

  return <ModelingLearningCenter courseId={course?.course_id ?? 0} lessons={lessonSummaries} signedIn={Boolean(userId)} />
}
