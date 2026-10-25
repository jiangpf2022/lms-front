import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import manifest from '@/content/mathematical-modeling/manifest.json'

/**
 * The repository copy is the canonical source for the Mathematical Modeling
 * course. Keeping public lesson reads on this copy means an article edit ships
 * atomically with its UI and does not depend on a second, manual database sync.
 * The database remains the source for publication/access metadata.
 */
export async function readLocalModelingLesson(sequence: number, courseTitle: string) {
  if (courseTitle !== manifest.course.title) return null
  const lesson = manifest.lessons.find((item) => item.number === sequence)
  if (!lesson) return null

  try {
    const absolutePath = path.join(
      process.cwd(),
      'content',
      'mathematical-modeling',
      lesson.contentFile
    )
    return await readFile(absolutePath, 'utf8')
  } catch (error) {
    console.warn('[modeling-content] local article unavailable; using database copy', {
      sequence,
      error: error instanceof Error ? error.message : 'unknown error',
    })
    return null
  }
}
