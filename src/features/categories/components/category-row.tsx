import { Pencil } from 'lucide-react'
import type { Category } from '@/types'

type CategoryRowProps = {
  category: Category
  transactionCount: number
  onEdit: (category: Category) => void
}

function transactionCountLabel(count: number): string {
  if (count === 0) return 'No transactions'
  return `${count} ${count === 1 ? 'transaction' : 'transactions'}`
}

export function CategoryRow({ category, transactionCount, onEdit }: CategoryRowProps) {
  const countLabel = transactionCountLabel(transactionCount)

  return (
    <li>
      <button
        type="button"
        onClick={() => onEdit(category)}
        aria-label={`Edit category: ${category.name}, ${countLabel}`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset sm:px-5"
      >
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full ring-1 ring-foreground/10"
          style={{ backgroundColor: category.color }}
        />
        <span className="min-w-0 flex-1 font-medium wrap-break-word">{category.name}</span>
        <span className="shrink-0 text-sm text-muted-foreground">{countLabel}</span>
        <Pencil aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  )
}
