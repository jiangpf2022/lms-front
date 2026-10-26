import type { Metadata } from 'next'
import { MockContestDetail } from '@/components/modeling/mock-contest-detail'

export const metadata: Metadata = { title: 'Mock Contest — Mathematical Modeling' }
export const dynamic = 'force-dynamic'

export default async function MockContestPage({ params }: { params: Promise<{ locale: string; contestId: string }> }) {
  const { locale, contestId } = await params
  return <MockContestDetail locale={locale} contestId={contestId} />
}
