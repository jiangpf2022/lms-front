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

function languagePanel(source, language) {
  return source.match(new RegExp(
    `<LanguagePanel\\s+language=["']${language}["'][^>]*>([\\s\\S]*?)<\\/LanguagePanel>`,
    'i'
  ))?.[1]?.trim() ?? ''
}

function count(source, pattern) {
  return (source.match(pattern) ?? []).length
}

function structuralMetrics(source) {
  return {
    levelTwoHeadings: count(source, /^##\s+/gm),
    levelThreeHeadings: count(source, /^###\s+/gm),
    images: count(source, /!\[/g),
    displayDollarDelimiters: count(source, /\$\$/g),
    displayBracketDelimiters: count(source, /\\\[/g),
    callouts: count(source, /<Callout\b/g),
    tableRows: count(source, /^\|.*\|\s*$/gm),
    codeFences: count(source, /^```/gm),
  }
}

function englishHeavyChineseLines(source) {
  const results = []
  let fenced = false

  source.split('\n').forEach((line, index) => {
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      fenced = !fenced
      return
    }
    const dollarDelimiters = (line.match(/\$\$/g) ?? []).length
    // Inspect prose line by line rather than carrying display-math state. A
    // malformed opening delimiter must not hide all following English prose
    // from this regression check.
    if (fenced || dollarDelimiters || /^\s*[|$\\]/.test(line) || /!\[/.test(line)) return

    const inspected = line
      .replace(/https?:\/\/\S+/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\$(?!\$)[^$]+\$/g, '')
    const latin = count(inspected, /[A-Za-z]/g)
    const han = count(inspected, /\p{Script=Han}/gu)
    if (latin > 100) results.push(index + 1)
  })

  return results
}

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
  if (/ZXQKEEP|ZXQSEP|<<<MM_/.test(source)) {
    failures.push(`${lesson.contentFile}: temporary translation marker remains`)
  }
  if (lesson.status === 'published') {
    const english = languagePanel(source, 'en')
    const chinese = languagePanel(source, 'zh')
    if (!english) failures.push(`${lesson.contentFile}: published lesson has no English panel`)
    if (!chinese) failures.push(`${lesson.contentFile}: published lesson has no Chinese panel`)
    if (!lesson.hasChinese) failures.push(`${lesson.contentFile}: manifest does not mark the published lesson as bilingual`)

    if (english && chinese) {
      const englishMetrics = structuralMetrics(english)
      const chineseMetrics = structuralMetrics(chinese)
      for (const key of Object.keys(englishMetrics)) {
        if (englishMetrics[key] !== chineseMetrics[key]) {
          failures.push(
            `${lesson.contentFile}: bilingual ${key} mismatch (${englishMetrics[key]} English, ${chineseMetrics[key]} Chinese)`
          )
        }
      }
      if (chinese.length / english.length < 0.25) {
        failures.push(`${lesson.contentFile}: Chinese panel is still only ${(100 * chinese.length / english.length).toFixed(1)}% of English length`)
      }
      const untranslated = englishHeavyChineseLines(chinese)
      if (untranslated.length) {
        failures.push(`${lesson.contentFile}: likely untranslated Chinese-panel lines ${untranslated.slice(0, 8).join(', ')}`)
      }
    }
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
