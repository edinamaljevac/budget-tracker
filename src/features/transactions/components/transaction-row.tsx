import { cva } from 'class-variance-authority'
import { ArrowDownLeft, ArrowUpRight, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, Transaction } from '@/types'
import { formatDayLabel } from '@/utils/date'
import { formatMoney, toCents } from '@/utils/money'

const typeIconVariants = cva('flex size-9 shrink-0 items-center justify-center rounded-full', {
  variants: {
    type: {
      income: 'bg-income/10 text-income',
      expense: 'bg-muted text-muted-foreground',
    },
  },
})

const amountVariants = cva('shrink-0 text-right font-semibold tabular-nums', {
  variants: {
    type: {
      income: 'text-income',
      expense: 'text-expense',
    },
  },
})

type TransactionRowProps = {
  transaction: Transaction
  category: Category | undefined
  onEdit: (transaction: Transaction) => void
}

export function TransactionRow({ transaction, category, onEdit }: TransactionRowProps) {
  const isIncome = transaction.type === 'income'
  const TypeIcon = isIncome ? ArrowDownLeft : ArrowUpRight
  const description = transaction.description?.trim()
  const descriptionLabel = description || 'No description'
  const dayLabel = formatDayLabel(transaction.date)
  const categoryName = category?.name ?? 'Unknown category'
  const cents = toCents(transaction.amount)
  const amountLabel = isIncome ? `+${formatMoney(cents)}` : formatMoney(-cents)

  return (
    <li>
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        aria-label={`Edit transaction: ${descriptionLabel}, ${dayLabel}, ${categoryName}, ${transaction.type} ${amountLabel}`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset sm:px-5"
      >
        <span aria-hidden="true" className={typeIconVariants({ type: transaction.type })}>
          <TypeIcon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block font-medium wrap-break-word',
              !description && 'text-muted-foreground italic',
            )}
          >
            {descriptionLabel}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            <time dateTime={transaction.date}>{dayLabel}</time>
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: category?.color }}
              />
              <span className="truncate">{categoryName}</span>
            </span>
          </span>
        </span>
        <span className={amountVariants({ type: transaction.type })}>{amountLabel}</span>
        <Pencil aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  )
}
