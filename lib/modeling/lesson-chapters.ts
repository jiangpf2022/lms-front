export type LessonChapterSource = {
  id: string
  title: string
  source: string
}

export type LessonChapterLanguages = {
  en: LessonChapterSource[]
  zh: LessonChapterSource[]
}

const FINAL_QUIZ_TITLES = /^(knowledge check|lesson quiz|final quiz|quiz|课后测验|知识检验|知识检查|综合测验)$/i

function panelSource(content: string, language: 'en' | 'zh') {
  const expression = new RegExp(
    `<LanguagePanel\\s+language=["']${language}["'][^>]*>([\\s\\S]*?)<\\/LanguagePanel>`,
    'i'
  )
  return content.match(expression)?.[1]?.trim() ?? null
}

function plainTitle(value: string) {
  return value
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function slug(value: string, index: number) {
  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
  return normalized || `chapter-${index + 1}`
}

function splitSource(source: string, language: 'en' | 'zh', lessonTitle: string) {
  const heading = /^##\s+(.+?)\s*$/gm
  const matches = [...source.matchAll(heading)]
  const chapters: LessonChapterSource[] = []
  const intro = source.slice(0, matches[0]?.index ?? source.length).trim()

  if (intro.length > 40) {
    chapters.push({
      id: `${language}-overview`,
      title: language === 'zh' ? '导读' : 'Overview',
      source: intro,
    })
  }

  matches.forEach((match, index) => {
    const title = plainTitle(match[1])
    if (FINAL_QUIZ_TITLES.test(title)) return
    const start = (match.index ?? 0) + match[0].length
    const end = matches[index + 1]?.index ?? source.length
    const body = source.slice(start, end).trim()
    if (!body) return
    chapters.push({
      id: `${language}-${slug(title || lessonTitle, index)}`,
      title,
      source: body,
    })
  })

  if (chapters.length === 0 && source.trim()) {
    chapters.push({
      id: `${language}-overview`,
      title: language === 'zh' ? '导读' : lessonTitle,
      source: source.trim(),
    })
  }

  return chapters
}

/**
 * Turn a long bilingual MDX post into independently compilable learning units.
 * The original source remains untouched; H2 boundaries become units and the
 * legacy end-of-post quiz is replaced by the new chapter/final quiz UI.
 */
export function extractLessonChapters(content: string, lessonTitle: string): LessonChapterLanguages {
  const english = panelSource(content, 'en')
  const chinese = panelSource(content, 'zh')

  if (english || chinese) {
    return {
      en: splitSource(english ?? chinese ?? content, 'en', lessonTitle),
      zh: chinese ? splitSource(chinese, 'zh', lessonTitle) : [],
    }
  }

  return {
    en: splitSource(content, 'en', lessonTitle),
    zh: [],
  }
}
