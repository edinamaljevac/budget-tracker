import { Plus } from 'lucide-react'
import type { Ref } from 'react'
import { Button } from '@/components/ui/button'
import type { CategorySummary } from '../utils'
import { CategorySpendingItem } from './category-spending-item'

type CategorySpendingProps = {
  summaries: CategorySummary[]
  canSetBudget: boolean
  headingRef: Ref<HTMLHeadingElement>
  onSetBudget: () => void
  onBudgetClick: (item: CategorySummary) => void
}

export function CategorySpending({
  summaries,
  canSetBudget,
  headingRef,
  onSetBudget,
  onBudgetClick,
}: CategorySpendingProps) {
  return (
    <section
      aria-labelledby="category-spending-heading"
      className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2
          ref={headingRef}
          id="category-spending-heading"
          tabIndex={-1}
          className="text-xl font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Spending by category
        </h2>
        {canSetBudget && (
          <Button variant="outline" size="sm" onClick={onSetBudget}>
            <Plus aria-hidden="true" />
            Set budget
          </Button>
        )}
      </div>
      {summaries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No expenses or budgets in this month.</p>
      ) : (
        <ul className="mt-4 divide-y">
          {summaries.map((item) => (
            <CategorySpendingItem
              key={item.category.id}
              item={item}
              onBudgetClick={() => onBudgetClick(item)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
