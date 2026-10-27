import type { Category } from '@/types'
import { CategoryRow } from './category-row'

type CategoryListProps = {
  categories: Category[]
  transactionCounts: Map<number, number>
  onEdit: (category: Category) => void
}

export function CategoryList({ categories, transactionCounts, onEdit }: CategoryListProps) {
  const sortedCategories = categories.toSorted((a, b) => a.name.localeCompare(b.name))

  return (
    <ul className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {sortedCategories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          transactionCount={transactionCounts.get(category.id) ?? 0}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
