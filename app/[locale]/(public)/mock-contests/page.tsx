import type { Metadata } from 'next'
import { MockContestCenter } from '@/components/modeling/mock-contest-center'

export const metadata: Metadata = { title: 'Timed Mock Contests — Mathematical Modeling' }
export const dynamic = 'force-dynamic'

export default async function MockContestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <MockContestCenter locale={locale} />
}
