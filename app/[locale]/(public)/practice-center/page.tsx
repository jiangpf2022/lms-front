import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import manifest from '@/content/mathematical-modeling/manifest.json'
import { PracticeCenter } from '@/components/modeling/practice-center'
import { extractLessonChapters } from '@/lib/modeling/lesson-chapters'
import { buildChapterQuiz } from '@/lib/modeling/math-quiz-bank'
import { getModelingDeveloperSettings, isModelingDeveloper, modelingLevel, modelingVisibility } from '@/lib/modeling/developer-settings'
import { getSessionUser } from '@/lib/supabase/tenant'
import { canAccessModelingLesson, getModelingUserAccess } from '@/lib/modeling/user-access'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const zh = locale.toLowerCase().startsWith('zh')
  return {
    title: zh ? '练习中心 — 数学建模' : 'Practice Center — Mathematical Modeling',
    description: zh
      ? '按课程、章节或随机题组练习数学建模题目。'
      : 'Practice mathematical modeling by blog, chapter, or a randomized mixed set.',
  }
}

export default async function PracticeCenterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const user = await getSessionUser()
  const [settings, access] = await Promise.all([
    getModelingDeveloperSettings(),
    getModelingUserAccess(user?.id),
  ])
  const developer = isModelingDeveloper(user)
  const published = manifest.lessons.filter((lesson) => {
    const level = modelingLevel(lesson.number, lesson.level, settings)
    return modelingVisibility(lesson.number, lesson.status, settings) === 'public'
      && canAccessModelingLesson({ developer, accessLevel: access.level, lessonLevel: level, lessonSequence: lesson.number })
  })
  const lessons = await Promise.all(published.map(async (lesson) => {
    const filePath = path.join(process.cwd(), 'content', 'mathematical-modeling', lesson.contentFile)
    const content = await fs.readFile(filePath, 'utf8')
    const chapters = extractLessonChapters(content, lesson.title)
    return {
      id: lesson.number,
      number: lesson.number,
      title: lesson.title,
      titleZh: lesson.titleZh,
      level: modelingLevel(lesson.number, lesson.level, settings),
      chapters: chapters.en.map((chapter, index) => ({
        title: chapter.title,
        titleZh: chapters.zh[index]?.title ?? chapter.title,
        questions: buildChapterQuiz(lesson.number, index, chapter.title),
      })),
    }
  }))

  return <PracticeCenter locale={locale} lessons={lessons} />
}
