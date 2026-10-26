export const MODELING_MOCK_CONTESTS_KEY = 'modeling-mock-contests-v1'

export type MockContestVisibility = 'draft' | 'listed'
export type MockContestPhase = 'draft' | 'upcoming' | 'open' | 'closed'

export type MockContestProblem = {
  id: string
  code: string
  title: string
  titleZh: string
  brief: string
  briefZh: string
}

export type MockContest = {
  id: string
  title: string
  titleZh: string
  summary: string
  summaryZh: string
  visibility: MockContestVisibility
  startsAt: string
  endsAt: string
  problems: MockContestProblem[]
  createdAt: string
  updatedAt: string
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

export function safeIsoDate(value: unknown) {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeProblem(value: unknown, index: number): MockContestProblem | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const title = text(raw.title)
  const titleZh = text(raw.titleZh)
  if (!title || !titleZh) return null
  return {
    id: text(raw.id, `problem-${index + 1}`),
    code: text(raw.code, String.fromCharCode(65 + index)),
    title,
    titleZh,
    brief: text(raw.brief),
    briefZh: text(raw.briefZh),
  }
}

export function normalizeMockContest(value: unknown): MockContest | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const id = text(raw.id)
  const title = text(raw.title)
  const titleZh = text(raw.titleZh)
  const startsAt = safeIsoDate(raw.startsAt)
  const endsAt = safeIsoDate(raw.endsAt)
  if (!id || !title || !titleZh || !startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) return null
  const problems = Array.isArray(raw.problems)
    ? raw.problems.map(normalizeProblem).filter((item): item is MockContestProblem => Boolean(item))
    : []
  const createdAt = safeIsoDate(raw.createdAt) ?? new Date().toISOString()
  return {
    id,
    title,
    titleZh,
    summary: text(raw.summary),
    summaryZh: text(raw.summaryZh),
    visibility: raw.visibility === 'listed' ? 'listed' : 'draft',
    startsAt,
    endsAt,
    problems,
    createdAt,
    updatedAt: safeIsoDate(raw.updatedAt) ?? createdAt,
  }
}

export function normalizeMockContests(value: unknown): MockContest[] {
  const rawItems = value && typeof value === 'object' && 'items' in value
    ? (value as { items?: unknown }).items
    : value
  if (!Array.isArray(rawItems)) return []
  return rawItems.map(normalizeMockContest).filter((item): item is MockContest => Boolean(item))
}

export function mockContestPhase(contest: Pick<MockContest, 'visibility' | 'startsAt' | 'endsAt'>, now = new Date()): MockContestPhase {
  if (contest.visibility === 'draft') return 'draft'
  if (now < new Date(contest.startsAt)) return 'upcoming'
  if (now <= new Date(contest.endsAt)) return 'open'
  return 'closed'
}
