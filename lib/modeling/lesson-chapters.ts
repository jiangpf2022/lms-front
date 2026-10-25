export type LessonChapterSource = {
  id: string
  title: string
  source: string
}

export type LessonChapterLanguages = {
  en: LessonChapterSource[]
  zh: LessonChapterSource[]
}

const FINAL_QUIZ_TITLES = /^(knowledge check|lesson quiz|final quiz|checkpoint quiz|quiz|课后测验|知识检验|知识检查|综合测验|综合检查)$/i

// Each entry groups the source article's existing units (overview is index 0)
// into a course-friendly sequence of no more than eight chapters.  The body is
// never shortened: merged H2 sections are retained as H3 subsections.
const CHAPTER_PLANS: Record<string, number[][]> = {
  'From Reality to a Model': [[0], [1, 2], [3], [4], [5], [6], [7, 8], [9]],
  'Competition Techniques': [[0, 1], [2], [3], [4], [5], [6, 7], [8, 9], [10, 11]],
  'Visual Evidence': [[0, 1], [2], [3], [4], [5], [6, 7], [8, 9], [10, 11]],
  'Linear, Quadratic & Conic Optimization': [[0], [1], [2, 3], [4], [5], [6], [7], [8, 9]],
  'Advanced Convex Optimization': [[0], [1, 2], [3], [4], [5, 6], [7], [8, 9], [10]],
  'Intelligent Optimization': [[0, 1], [2], [3], [4], [5], [6], [7], [8, 9]],
  'Differential Equations 101': [[0, 1], [2], [3, 4], [5, 6], [7], [8], [9], [10]],
  'Coupled Differential-Equation Models': [[0, 1], [2], [3, 4], [5], [6], [7], [8], [9]],
  'Time Series 101': [[0, 1], [2], [3], [4], [5], [6], [7], [8]],
  'Data Preparation 101': [[0, 1], [2], [3], [4], [5], [6], [7], [8]],
  'Evaluation Models 101': [[0, 1], [2], [3], [4], [5], [6], [7], [8]],
  'Writing the Abstract': [[0, 1], [2], [3], [4], [5, 6], [7], [8], [9]],
  'Writing the Main Text': [[0, 1], [2], [3, 4], [5, 6], [7], [8], [9], [10]],
}

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

  if (chapters.length <= 8) return chapters

  const configuredPlan = CHAPTER_PLANS[lessonTitle]
  const covered = configuredPlan?.flat() ?? []
  const isCompletePlan = configuredPlan
    && covered.length === chapters.length
    && new Set(covered).size === chapters.length
    && covered.every((index) => index >= 0 && index < chapters.length)

  // Unknown future articles still obey the eight-chapter contract. Adjacent
  // units are balanced into buckets so the original reading order is stable.
  const plan = isCompletePlan
    ? configuredPlan
    : Array.from({ length: 8 }, (_, groupIndex) => {
        const start = Math.floor((groupIndex * chapters.length) / 8)
        const end = Math.floor(((groupIndex + 1) * chapters.length) / 8)
        return Array.from({ length: end - start }, (__, offset) => start + offset)
      }).filter((group) => group.length > 0)

  return plan.map((group, groupIndex) => {
    const [leadIndex, ...following] = group
    const lead = chapters[leadIndex]
    const source = [
      lead.source,
      ...following.map((index) => `### ${chapters[index].title}\n\n${chapters[index].source}`),
    ].filter(Boolean).join('\n\n')
    return {
      id: `${language}-${slug(lead.title || lessonTitle, groupIndex)}`,
      title: lead.title,
      source,
    }
  })
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
