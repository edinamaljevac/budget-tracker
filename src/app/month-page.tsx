import { QueryBoundary } from '@/components/query-boundary'
import { MonthContent } from './month-content'
import { MonthPageSkeleton } from './month-page-skeleton'

export function MonthPage() {
  return (
    <>
      <h1 className="sr-only">Overview</h1>
      <QueryBoundary fallback={<MonthPageSkeleton />}>
        <MonthContent />
      </QueryBoundary>
    </>
  )
}
