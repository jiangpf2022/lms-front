#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const defaultSource = path.resolve(
  projectRoot,
  '../jiangpf2022.github.io/blog-src'
)

function option(name, fallback) {
  const position = process.argv.indexOf(`--${name}`)
  return position >= 0 && process.argv[position + 1]
    ? path.resolve(process.argv[position + 1])
    : fallback
}

const sourceRoot = option('source', process.env.MODELING_BLOG_SOURCE || defaultSource)
const outputRoot = path.join(projectRoot, 'content', 'mathematical-modeling')
const publicRoot = path.join(projectRoot, 'public', 'mathematical-modeling')

function parseScalar(raw) {
  const value = raw.trim()
  if (/^['"].*['"]$/.test(value)) return value.slice(1, -1)
  if (/^(true|false)$/i.test(value)) return value.toLowerCase() === 'true'
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return { data: {}, body: text }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) return { data: {}, body: text }
  const data = {}
  let activeList = null
  for (const line of text.slice(4, end).split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (listItem && activeList) {
      data[activeList].push(parseScalar(listItem[1]))
      continue
    }
    const entry = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!entry) continue
    const [, key, raw] = entry
    if (!raw) {
      data[key] = []
      activeList = key
    } else {
      data[key] = parseScalar(raw)
      activeList = null
    }
  }
  return { data, body: text.slice(end + 5) }
}

function stripTags(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p(?:\s[^>]*)?>/gi, '')
    .replace(/<strong(?:\s[^>]*)?>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em(?:\s[^>]*)?>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<code(?:\s[^>]*)?>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<li(?:\s[^>]*)?>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?(?:ol|ul|div|span|aside|section)(?:\s[^>]*)?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function normalizeImagePath(src) {
  return src
    .replace(/^\/blog\/images\/mathematical-modeling\//, '/mathematical-modeling/')
    .replace(/^\/images\/mathematical-modeling\//, '/mathematical-modeling/')
    .replace(/^\/blog\/images\/mathematical-modeling-nyc\.webp$/, '/mathematical-modeling/course-cover.webp')
    .replace(/^\/images\/mathematical-modeling-nyc\.webp$/, '/mathematical-modeling/course-cover.webp')
}

function normalizeBody(input) {
  let body = input.replace(/\r\n/g, '\n')

  body = body.replace(
    /<section\b[^>]*class=["'][^"']*modeling-quiz[^"']*["'][\s\S]*?<\/section>/gi,
    ''
  )
  body = body.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  body = body.replace(/<style\b[\s\S]*?<\/style>/gi, '')

  body = body.replace(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi, (_match, inner) => {
    const image = inner.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i)
    if (!image) return stripTags(inner)
    const alt = inner.match(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/i)?.[1] || ''
    const captionRaw = inner.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]
    const caption = captionRaw ? stripTags(captionRaw).trim() : ''
    const markdown = `![${alt.replace(/\]/g, '\\]')}](${normalizeImagePath(image[1])})`
    return caption ? `\n\n${markdown}\n\n*${caption}*\n\n` : `\n\n${markdown}\n\n`
  })

  body = body.replace(/<aside\b[^>]*>([\s\S]*?)<\/aside>/gi, (_match, inner) => {
    const label = inner.match(/<span\b[^>]*mm-callout-label[^>]*>([\s\S]*?)<\/span>/i)?.[1]
    const content = stripTags(inner.replace(/<span\b[^>]*mm-callout-label[^>]*>[\s\S]*?<\/span>/i, '')).trim()
    const title = label ? `**${stripTags(label).trim()}**\n\n` : ''
    return `\n\n@@MODELING_CALLOUT_OPEN@@\n\n${title}${content}\n\n@@MODELING_CALLOUT_CLOSE@@\n\n`
  })

  body = body.replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi,
    (_match, src, alt) => `![${alt.replace(/\]/g, '\\]')}](${normalizeImagePath(src)})`)
  body = body.replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi,
    (_match, alt, src) => `![${alt.replace(/\]/g, '\\]')}](${normalizeImagePath(src)})`)

  body = stripTags(body)
  body = body
    .replace(/@@MODELING_CALLOUT_OPEN@@/g, '<Callout type="tip">')
    .replace(/@@MODELING_CALLOUT_CLOSE@@/g, '</Callout>')
  body = body.replace(/\]\((\/blog)?\/images\/mathematical-modeling\//g, '](/mathematical-modeling/')
  body = body.replace(/\]\((\/blog)?\/images\/mathematical-modeling-nyc\.webp\)/g, '](/mathematical-modeling/course-cover.webp)')
  body = body.replace(/\n{4,}/g, '\n\n\n')
  return body.trim() + '\n'
}

function wordCount(text) {
  const latin = text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length || 0
  const han = text.match(/[\p{Script=Han}]/gu)?.length || 0
  return latin + han
}

function titleWithoutNumber(title) {
  return String(title || '').replace(/^\s*\d+\s*[-–—:]\s*/, '').trim()
}

async function readLessons() {
  const postsDirectory = path.join(sourceRoot, 'source', '_posts')
  const names = (await fs.readdir(postsDirectory))
    .filter((name) => /^Mathematical-Modeling-.*\.md$/i.test(name))
    .sort()
  const records = []
  for (const name of names) {
    const raw = await fs.readFile(path.join(postsDirectory, name), 'utf8')
    const parsed = parseFrontmatter(raw)
    if (!Number.isInteger(parsed.data.lesson_number)) {
      const inferredNumber = Number(String(parsed.data.title || '').match(/^\s*(\d+)\s*[-–—:]/)?.[1])
      if (!recordIsTranslation(name, parsed.data) || !Number.isInteger(inferredNumber)) continue
      parsed.data.lesson_number = inferredNumber
    }
    records.push({ name, ...parsed })
  }
  const byLesson = new Map()
  for (const record of records) {
    const number = record.data.lesson_number
    const locale = record.name.includes('-zh.') || record.data.translation_of ? 'zh' : 'en'
    const existing = byLesson.get(number) || { number }
    existing[locale] = record
    byLesson.set(number, existing)
  }
  return [...byLesson.values()].sort((a, b) => a.number - b.number)
}

function recordIsTranslation(name, data) {
  return name.includes('-zh.') || Boolean(data.translation_of)
}

async function readQuizBanks() {
  const quizPath = path.join(sourceRoot, 'source', 'js', 'modeling-quiz.js')
  let source = await fs.readFile(quizPath, 'utf8')
  source = source.replace('const quizBanks = {', 'const quizBanks = globalThis.__quizBanks = {')
  const document = {
    addEventListener() {},
    querySelectorAll() { return [] },
  }
  const context = {
    document,
    window: { document },
    console: { error() {}, warn() {}, log() {} },
    localStorage: { getItem() { return null }, setItem() {} },
  }
  context.window.window = context.window
  vm.createContext(context)
  vm.runInContext(source, context, { filename: quizPath, timeout: 5000 })
  return JSON.parse(JSON.stringify(context.__quizBanks || {}))
}

async function copyAssets() {
  await fs.rm(publicRoot, { recursive: true, force: true })
  await fs.mkdir(publicRoot, { recursive: true })
  const imageSource = path.join(sourceRoot, 'source', 'images', 'mathematical-modeling')
  await fs.cp(imageSource, publicRoot, { recursive: true })
  await fs.copyFile(
    path.join(sourceRoot, 'source', 'images', 'mathematical-modeling-nyc.webp'),
    path.join(publicRoot, 'course-cover.webp')
  )
  const svgSource = path.join(sourceRoot, 'source', 'images', 'mathematical-modeling-course.svg')
  try {
    await fs.copyFile(svgSource, path.join(publicRoot, 'course-mark.svg'))
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

async function main() {
  const lessons = await readLessons()
  const quizBanks = await readQuizBanks()
  await fs.rm(outputRoot, { recursive: true, force: true })
  await fs.mkdir(path.join(outputRoot, 'lessons'), { recursive: true })
  await copyAssets()

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'OneDrive/jiangpf2022.github.io/blog-src',
    course: {
      title: 'Mathematical Modeling',
      slug: 'mathematical-modeling',
      description: 'A bilingual, competition-oriented path from real problems to defensible mathematical models, algorithms, evidence, and technical writing.',
      cover: '/mathematical-modeling/course-cover.webp',
    },
    lessons: [],
  }

  for (const lesson of lessons) {
    if (!lesson.en) throw new Error(`Lesson ${lesson.number} has no English source`)
    const english = normalizeBody(lesson.en.body)
    const chinese = lesson.zh ? normalizeBody(lesson.zh.body) : null
    const sourceWords = wordCount(english)
    const isPlaceholder = sourceWords < 500
    const number = String(lesson.number).padStart(2, '0')
    const filename = `${number}-${lesson.en.name.replace(/^Mathematical-Modeling-\d+-/, '').replace(/\.md$/, '').toLowerCase()}.mdx`
    const sections = []
    if (chinese) {
      sections.push('<LanguageTabs>')
      sections.push('<LanguagePanel language="en" label="English">\n')
      sections.push(english)
      sections.push('\n</LanguagePanel>')
      sections.push('<LanguagePanel language="zh" label="中文">\n')
      sections.push(chinese)
      sections.push('\n</LanguagePanel>')
      sections.push('</LanguageTabs>')
    } else {
      sections.push(english)
    }
    await fs.writeFile(path.join(outputRoot, 'lessons', filename), sections.join('\n\n'))

    const quiz = quizBanks[`lesson-${lesson.number}`]
    manifest.lessons.push({
      number: lesson.number,
      title: titleWithoutNumber(lesson.en.data.title),
      titleZh: lesson.zh ? titleWithoutNumber(lesson.zh.data.title) : null,
      level: lesson.en.data.lesson_level || 1,
      studyTimeMinutes: lesson.en.data.study_time || Math.max(10, Math.ceil(sourceWords / 180)),
      excerpt: lesson.en.data.excerpt || '',
      tags: Array.isArray(lesson.en.data.tags) ? lesson.en.data.tags : [],
      status: isPlaceholder ? 'draft' : 'published',
      contentFile: `lessons/${filename}`,
      sourceFile: lesson.en.name,
      translationFile: lesson.zh?.name || null,
      wordCount: sourceWords,
      hasChinese: Boolean(chinese),
      quizCount: quiz?.questions?.length || 0,
      cover: lesson.en.data.cover ? normalizeImagePath(String(lesson.en.data.cover)) : null,
    })
  }

  await fs.writeFile(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  await fs.writeFile(path.join(outputRoot, 'quizzes.json'), JSON.stringify(quizBanks, null, 2) + '\n')

  const published = manifest.lessons.filter((lesson) => lesson.status === 'published').length
  const translated = manifest.lessons.filter((lesson) => lesson.hasChinese).length
  const questions = manifest.lessons.reduce((sum, lesson) => sum + lesson.quizCount, 0)
  console.log(`Exported ${manifest.lessons.length} lessons (${published} published, ${translated} bilingual).`)
  console.log(`Exported ${questions} quiz questions and copied assets to public/mathematical-modeling.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
