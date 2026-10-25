import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { isFreePreviewEnabled } from '@/lib/settings/free-preview'
import { getCurrentTenantId } from '@/lib/supabase/tenant'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { serializeLessonMdx } from '@/app/[locale]/dashboard/student/courses/[courseId]/lessons/[lessonId]/serialize-lesson'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { extractLessonChapters } from '@/lib/modeling/lesson-chapters'
import { ModelingLessonReader } from '@/components/modeling/modeling-lesson-reader'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string; lessonId: string; locale: string }>
}

// Public free-preview lesson view (#426). Reachable by anyone — including
// logged-out visitors (/courses/* is in the proxy public-route allowlist).
// Uses the admin client with explicit guards mirroring the anon RLS policy:
// published preview lesson, published course, current tenant. Read-only:
// no completion tracking, no checkpoints, no comments, no AI task.
// cache() dedupes the generateMetadata + page calls within a request.
const getPreviewLesson = cache(async (courseId: number, lessonId: number, tenantId: string) => {
    if (!Number.isInteger(courseId) || !Number.isInteger(lessonId)) return null
    // A school can switch public previews off for the whole tenant (#799).
    // The anon RLS policy enforces the same rule, but this page reads through
    // the admin client and so would sail straight past it.
    if (!(await isFreePreviewEnabled(tenantId))) return null
    const admin = createAdminClient()

    const [{ data: course }, { data: lesson }, { data: siblings }, { data: linkedProducts }] = await Promise.all([
        admin
            .from('courses')
            .select('course_id, title')
            .eq('course_id', courseId)
            .eq('tenant_id', tenantId)
            .eq('status', 'published')
            .single(),
        admin
            .from('lessons')
            .select('id, title, sequence, description, image, content, video_url, embed_code')
            .eq('id', lessonId)
            .eq('course_id', courseId)
            .eq('tenant_id', tenantId)
            .eq('status', 'published')
            .eq('is_preview', true)
            .single(),
        // The rest of the free preview, so this page is not a dead end (#791).
        // Same three guards as the lesson above — anything else is not public.
        admin
            .from('lessons')
            .select('id, title, sequence')
            .eq('course_id', courseId)
            .eq('tenant_id', tenantId)
            .eq('status', 'published')
            .eq('is_preview', true)
            .order('sequence', { ascending: true }),
        // `product_courses` is never `.single()`: a course can belong to
        // several products. Free means none of them costs anything, which is
        // the same rule `enrollFree` enforces server-side.
        admin
            .from('product_courses')
            .select('product:products(price)')
            .eq('course_id', courseId)
            .eq('tenant_id', tenantId),
    ])
    if (!course || !lesson) return null

    const previews = siblings ?? []
    const position = previews.findIndex((row) => row.id === lesson.id)
    const nextPreview = position >= 0 ? previews[position + 1] ?? null : null

    const isFree = !(linkedProducts ?? []).some(({ product }) => {
        const linked = product as unknown as { price: number | string } | null
        return linked !== null && Number(linked.price) !== 0
    })

    return { course, lesson, nextPreview, isFree }
})

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { id, lessonId, locale } = await props.params
    const tenantId = await getCurrentTenantId()
    const [data, t] = await Promise.all([
        getPreviewLesson(Number(id), Number(lessonId), tenantId),
        getTranslations('coursePublicDetails'),
    ])
    if (!data) notFound()
    // Same branded course card as /courses/[id] (issue #765/#799): `courseId`
    // is what lets the OG route reach for the course's thumbnail and the
    // school's logo. The card still names THIS lesson — the route prefers the
    // title the caller passes over the course's own.
    return buildPageMetadata({
        title: `${data.lesson.title} — ${data.course.title}`,
        description: data.lesson.description?.replace(/\s+/g, ' ').trim().slice(0, 160) || data.course.title,
        path: `/courses/${id}/lessons/${lessonId}`,
        locale,
        ogParams: { type: 'course', courseId: id },
        ogBadge: t('preview.badge'),
    })
}

export default async function PublicLessonPreviewPage(props: PageProps) {
    const { id, lessonId, locale } = await props.params
    const tenantId = await getCurrentTenantId()

    const data = await getPreviewLesson(Number(id), Number(lessonId), tenantId)
    if (!data) notFound()
    const { course, lesson, nextPreview } = data
    const sourceChapters = extractLessonChapters(lesson.content, lesson.title)
    const serialize = async (chapter: (typeof sourceChapters.en)[number]) => ({
        id: chapter.id,
        title: chapter.title,
        mdx: await serializeLessonMdx(chapter.source),
    })
    const [english, chinese] = await Promise.all([
        Promise.all(sourceChapters.en.map(serialize)),
        Promise.all(sourceChapters.zh.map(serialize)),
    ])

    return (
        <ModelingLessonReader
            locale={locale}
            courseId={Number(id)}
            lessonId={lesson.id}
            lessonNumber={lesson.sequence}
            courseTitle={course.title}
            lessonTitle={lesson.title}
            lessonDescription={lesson.description}
            chapters={{ en: english, zh: chinese }}
            nextLesson={nextPreview}
        />
    )
}
