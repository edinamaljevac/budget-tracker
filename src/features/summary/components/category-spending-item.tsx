import { cva } from 'class-variance-authority'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatMoney } from '@/utils/money'
import type { CategorySummary } from '../utils'
import { BudgetStatusText } from './budget-status-text'

const budgetBarVariants = cva('mt-2 h-2', {
  variants: {
    over: {
      true: '*:data-[slot=progress-indicator]:bg-over-budget',
      false: '',
    },
  },
})

type CategorySpendingItemProps = {
  item: CategorySummary
  onBudgetClick: () => void
}

export function CategorySpendingItem({ item, onBudgetClick }: CategorySpendingItemProps) {
  const { category, spentCents, budget } = item

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="truncate">{category.name}</span>
        </span>
        <span className="font-medium tabular-nums">{formatMoney(spentCents)}</span>
      </div>
      {budget && (
        <Progress
          value={(budget.spentCents / budget.budgetCents) * 100}
          aria-label={`${category.name} budget used`}
          getValueLabel={() =>
            `${formatMoney(budget.spentCents)} of ${formatMoney(budget.budgetCents)}`
          }
          className={budgetBarVariants({ over: budget.isOver })}
        />
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBudgetClick}
          aria-label={
            budget
              ? `Change ${category.name} budget, ${formatMoney(budget.budgetCents)}`
              : `Set budget for ${category.name}`
          }
          className="-ml-2.5 text-muted-foreground tabular-nums"
        >
          {budget ? (
            <>
              Budget {formatMoney(budget.budgetCents)}
              <Pencil aria-hidden="true" />
            </>
          ) : (
            <>
              <Plus aria-hidden="true" />
              Set budget
            </>
          )}
        </Button>
        <BudgetStatusText budget={budget} />
      </div>
    </li>
  )
}
