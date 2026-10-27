import { TriangleAlert } from 'lucide-react'
import { formatMoney } from '@/utils/money'
import type { BudgetStatus } from '../utils'

type BudgetStatusTextProps = {
  budget: BudgetStatus | null
}

export function BudgetStatusText({ budget }: BudgetStatusTextProps) {
  if (!budget) return <span className="text-muted-foreground">No budget</span>

  if (budget.isOver) {
    return (
      <span className="flex items-center gap-1 font-medium text-over-budget tabular-nums">
        <TriangleAlert aria-hidden="true" className="size-4" />
        {formatMoney(-budget.remainingCents)} over budget
      </span>
    )
  }
  return <span className="tabular-nums">{formatMoney(budget.remainingCents)} left</span>
}
