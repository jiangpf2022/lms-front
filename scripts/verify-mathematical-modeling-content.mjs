#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { serialize } from 'next-mdx-remote-client/serialize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content', 'mathematical-modeling')
const publicRoot = path.join(root, 'public')
const manifest = JSON.parse(await fs.readFile(path.join(contentRoot, 'manifest.json'), 'utf8'))
const failures = []

for (const lesson of manifest.lessons) {
  const lessonPath = path.join(contentRoot, lesson.contentFile)
  const source = await fs.readFile(lessonPath, 'utf8')
  if (!source.trim()) failures.push(`${lesson.contentFile}: empty lesson`)
  if (/<(?:figure|aside|section)\b/i.test(source)) {
    failures.push(`${lesson.contentFile}: unsupported raw HTML remains`)
  }
  if (/\/blog\/images\//.test(source)) {
    failures.push(`${lesson.contentFile}: legacy /blog/images path remains`)
  }
  for (const match of source.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)) {
    const assetPath = path.join(publicRoot, match[1])
    try {
      await fs.access(assetPath)
    } catch {
      failures.push(`${lesson.contentFile}: missing ${match[1]}`)
    }
  }
  try {
    await serialize({
      source,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeKatex],
          development: false,
        },
      },
    })
  } catch (error) {
    failures.push(`${lesson.contentFile}: MDX compile failed — ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  const published = manifest.lessons.filter((lesson) => lesson.status === 'published').length
  const questions = manifest.lessons.reduce((sum, lesson) => sum + lesson.quizCount, 0)
  console.log(`Verified ${manifest.lessons.length} lessons (${published} published), ${questions} quiz questions, and all local image references.`)
}
