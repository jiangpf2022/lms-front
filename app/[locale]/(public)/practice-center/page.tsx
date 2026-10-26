import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import manifest from '@/content/mathematical-modeling/manifest.json'
import { PracticeCenter } from '@/components/modeling/practice-center'
import { extractLessonChapters } from '@/lib/modeling/lesson-chapters'
import { buildChapterQuiz } from '@/lib/modeling/math-quiz-bank'
import { getModelingDeveloperSettings, modelingLevel, modelingVisibility } from '@/lib/modeling/developer-settings'

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
  const settings = await getModelingDeveloperSettings()
  const published = manifest.lessons.filter((lesson) => modelingVisibility(lesson.number, lesson.status, settings) === 'public')
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
