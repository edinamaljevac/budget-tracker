import { formatMoney } from '@/utils/money'
import { cn } from '@/lib/utils'
import type { MonthlySummary } from '../utils'

type SummaryTotalsProps = {
  summary: MonthlySummary
}

export function SummaryTotals({ summary }: SummaryTotalsProps) {
  const isNegative = summary.balanceCents < 0

  return (
    <section
      aria-labelledby="totals-heading"
      className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
    >
      <h2 id="totals-heading" className="sr-only">
        Totals
      </h2>
      <dl className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10">
        <div>
          <dt className="text-sm text-muted-foreground">Balance</dt>
          <dd
            className={cn(
              'font-heading text-4xl font-semibold tabular-nums sm:text-5xl',
              isNegative && 'text-over-budget',
            )}
          >
            {formatMoney(summary.balanceCents)}
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:gap-8 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
          <div>
            <dt className="text-sm text-muted-foreground">Income</dt>
            <dd className="text-lg font-semibold text-income tabular-nums">
              +{formatMoney(summary.incomeCents)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Expenses</dt>
            <dd className="text-lg font-semibold text-expense tabular-nums">
              {formatMoney(-summary.expenseCents)}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  )
}
