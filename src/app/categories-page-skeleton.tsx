import { Skeleton } from '@/components/ui/skeleton'

export function CategoriesPageSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="sr-only">Loading your data…</span>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}
