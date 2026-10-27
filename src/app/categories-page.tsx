import { QueryBoundary } from '@/components/query-boundary'
import { CategoriesContent } from './categories-content'
import { CategoriesPageSkeleton } from './categories-page-skeleton'

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold sm:text-4xl">Categories</h1>
      <QueryBoundary fallback={<CategoriesPageSkeleton />}>
        <CategoriesContent />
      </QueryBoundary>
    </div>
  )
}
