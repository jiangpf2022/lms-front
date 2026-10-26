import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentTenantId, getSessionUser } from '@/lib/supabase/tenant'
import { isModelingDeveloper } from '@/lib/modeling/developer-settings'
import { ModelingDeveloperCenter } from '@/components/modeling/modeling-developer-center'
import modelingManifest from '@/content/mathematical-modeling/manifest.json'
import { readLocalModelingLesson } from '@/lib/modeling/local-content'
import { extractLessonChapters } from '@/lib/modeling/lesson-chapters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Developer Center — Mathematical Modeling',
  robots: { index: false, follow: false },
}

export default async function DeveloperCenterPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, user, tenantId] = await Promise.all([params, getSessionUser(), getCurrentTenantId()])
  if (!isModelingDeveloper(user)) notFound()
  const admin = createAdminClient()
  const { data: course } = await admin.from('courses').select('course_id').eq('tenant_id', tenantId).eq('title', 'Mathematical Modeling').maybeSingle()
  const { data: rows } = course
    ? await admin.from('lessons').select('id,sequence,title,status').eq('tenant_id', tenantId).eq('course_id', course.course_id).order('sequence')
    : { data: [] }
  const rowMap = new Map((rows ?? []).map((row) => [row.sequence, row]))
  const lessons = await Promise.all(modelingManifest.lessons.map(async (item) => {
    const source = await readLocalModelingLesson(item.number, modelingManifest.course.title)
    const totalUnits = source ? extractLessonChapters(source, item.title).en.length + 1 : 9
    return {
      id: rowMap.get(item.number)?.id ?? item.number,
      sequence: item.number,
      title: item.title,
      titleZh: item.titleZh,
      level: item.level,
      databaseStatus: rowMap.get(item.number)?.status ?? item.status,
      totalUnits,
    }
  }))
  return <ModelingDeveloperCenter lessons={lessons} locale={locale} />
}
