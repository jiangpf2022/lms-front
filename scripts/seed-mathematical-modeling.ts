import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

type ManifestLesson = {
  number: number
  title: string
  level: number
  studyTimeMinutes: number
  excerpt: string
  tags: string[]
  status: 'draft' | 'published'
  contentFile: string
  quizCount: number
  cover: string | null
}

type Manifest = {
  course: {
    title: string
    description: string
    cover: string
  }
  lessons: ManifestLesson[]
}

type SourceQuestion = {
  target: number
  exp: number
  multiple?: boolean
  answer: string[]
  en: { question: string; options: string[]; explanation: string }
  zh: { question: string; options: string[]; explanation: string }
}

type QuizBank = {
  prefix: string
  questions: SourceQuestion[]
}

const root = process.cwd()
const contentRoot = path.join(root, 'content', 'mathematical-modeling')
const tenantId = process.env.MODELING_TENANT_ID || '00000000-0000-0000-0000-000000000001'
const ownerId = process.env.MODELING_OWNER_USER_ID || null
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function expectData<T>(result: { data: T | null; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`)
  if (result.data === null) throw new Error(`${label}: no data returned`)
  return result.data
}

async function ensureCategory() {
  const found = await supabase
    .from('course_categories')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('name', 'Mathematical Modeling')
    .is('deleted_at', null)
    .limit(1)
  if (found.error) throw found.error
  if (found.data?.[0]) return found.data[0].id
  const inserted = await supabase
    .from('course_categories')
    .insert({
      tenant_id: tenantId,
      name: 'Mathematical Modeling',
      description: 'Competition-oriented mathematical modeling courses, cases, and review material.',
    })
    .select('id')
    .single()
  return expectData(inserted, 'create category').id
}

async function ensureAcademyBranding() {
  const tenant = await supabase
    .from('tenants')
    .update({ name: "Gavin's Modeling Academy" })
    .eq('id', tenantId)
  if (tenant.error) throw tenant.error

  const settings = await supabase.from('tenant_settings').upsert(
    [
      {
        tenant_id: tenantId,
        setting_key: 'site_name',
        setting_value: { value: "Gavin's Modeling Academy" },
      },
      {
        tenant_id: tenantId,
        setting_key: 'logo_url',
        setting_value: { value: '/mathematical-modeling/course-mark.svg' },
      },
    ],
    { onConflict: 'tenant_id,setting_key' }
  )
  if (settings.error) throw settings.error
}

async function ensureCourse(manifest: Manifest, categoryId: number) {
  const found = await supabase
    .from('courses')
    .select('course_id')
    .eq('tenant_id', tenantId)
    .eq('title', manifest.course.title)
    .is('deleted_at', null)
    .limit(1)
  if (found.error) throw found.error
  const values = {
    tenant_id: tenantId,
    title: manifest.course.title,
    description: manifest.course.description,
    thumbnail_url: manifest.course.cover,
    category_id: categoryId,
    author_id: ownerId,
    tags: ['mathematical modeling', 'CUMCM', 'MCM/ICM', 'optimization'],
    learning_objectives: [
      'Translate an ambiguous real problem into a testable mathematical model.',
      'Select, derive, implement, and audit suitable modeling methods.',
      'Communicate assumptions, evidence, uncertainty, and recommendations clearly.',
    ],
    estimated_duration_minutes: manifest.lessons.reduce((sum, lesson) => sum + lesson.studyTimeMinutes, 0),
    require_sequential_completion: false,
    status: 'published' as const,
    published_at: new Date().toISOString(),
  }
  if (found.data?.[0]) {
    const updated = await supabase
      .from('courses')
      .update(values)
      .eq('course_id', found.data[0].course_id)
      .eq('tenant_id', tenantId)
      .select('course_id')
      .single()
    return expectData(updated, 'update course').course_id
  }
  const inserted = await supabase.from('courses').insert(values).select('course_id').single()
  return expectData(inserted, 'create course').course_id
}

async function ensureLesson(courseId: number, lesson: ManifestLesson) {
  const content = await fs.readFile(path.join(contentRoot, lesson.contentFile), 'utf8')
  const found = await supabase
    .from('lessons')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('course_id', courseId)
    .eq('sequence', lesson.number)
    .limit(1)
  if (found.error) throw found.error
  const values = {
    tenant_id: tenantId,
    course_id: courseId,
    sequence: lesson.number,
    title: lesson.title,
    description: lesson.excerpt,
    summary: `Level ${lesson.level} · ${lesson.studyTimeMinutes} minute reference reading`,
    content,
    image: lesson.cover,
    status: lesson.status,
    // The original GitHub Pages course was public. Keep every released chapter
    // readable without enrollment; drafts remain locked by their status.
    is_preview: lesson.status === 'published',
    publish_at: lesson.status === 'published' ? new Date().toISOString() : null,
  }
  if (found.data?.[0]) {
    const updated = await supabase
      .from('lessons')
      .update(values)
      .eq('id', found.data[0].id)
      .eq('tenant_id', tenantId)
      .select('id')
      .single()
    return expectData(updated, `update lesson ${lesson.number}`).id
  }
  const inserted = await supabase.from('lessons').insert(values).select('id').single()
  return expectData(inserted, `create lesson ${lesson.number}`).id
}

function quizConfig(bank: QuizBank) {
  const singleChoice = bank.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => !question.multiple && question.answer.length === 1)
    .map(({ question, index }) => ({
      id: `${bank.prefix}${index + 1}`,
      type: 'multiple_choice',
      prompt: question.en.question,
      options: question.en.options,
      correctIndex: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(question.answer[0]),
      explanation: question.en.explanation,
    }))
  return {
    passing_score: 70,
    source_bank: bank.prefix,
    questions: singleChoice,
  }
}

async function ensureQuizExercise(
  courseId: number,
  lessonId: number,
  lesson: ManifestLesson,
  bank: QuizBank | undefined
) {
  if (!bank?.questions?.length) return
  const title = `Lesson ${lesson.number} Knowledge Check`
  const found = await supabase
    .from('exercises')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('course_id', courseId)
    .eq('lesson_id', lessonId)
    .eq('title', title)
    .limit(1)
  if (found.error) throw found.error
  const config = quizConfig(bank)
  const multiCount = bank.questions.filter((question) => question.multiple).length
  const values = {
    tenant_id: tenantId,
    course_id: courseId,
    lesson_id: lessonId,
    title,
    description: 'A progressive mathematical modeling knowledge check drawn from the original course quiz bank.',
    instructions: `Complete the single-answer questions in the LMS. The migration archive also preserves ${multiCount} multi-select questions for the forthcoming multi-select checkpoint UI.`,
    exercise_type: 'quiz' as const,
    difficulty_level: lesson.level >= 3 ? 'hard' as const : lesson.level === 2 ? 'medium' as const : 'easy' as const,
    status: lesson.status,
    created_by: ownerId,
    time_limit: 25,
    exercise_config: config,
    template_variables: {
      bilingual_source_bank: bank,
      migration_note: 'Multi-select questions are retained here losslessly until the LMS checkpoint renderer supports them.',
    },
  }
  if (found.data?.[0]) {
    const updated = await supabase
      .from('exercises')
      .update(values)
      .eq('id', found.data[0].id)
      .eq('tenant_id', tenantId)
    if (updated.error) throw updated.error
  } else {
    const inserted = await supabase.from('exercises').insert(values)
    if (inserted.error) throw inserted.error
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(contentRoot, 'manifest.json'), 'utf8')) as Manifest
  const quizBanks = JSON.parse(await fs.readFile(path.join(contentRoot, 'quizzes.json'), 'utf8')) as Record<string, QuizBank>
  await ensureAcademyBranding()
  const categoryId = await ensureCategory()
  const courseId = await ensureCourse(manifest, categoryId)

  for (const lesson of manifest.lessons) {
    const lessonId = await ensureLesson(courseId, lesson)
    await ensureQuizExercise(courseId, lessonId, lesson, quizBanks[`lesson-${lesson.number}`])
    console.log(`${lesson.number.toString().padStart(2, '0')} ${lesson.status.padEnd(9)} ${lesson.title}`)
  }

  console.log(`Seeded course ${courseId} into tenant ${tenantId}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
