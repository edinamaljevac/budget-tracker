import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { EmptyMessage } from '@/components/empty-message'
import { Button } from '@/components/ui/button'
import type { Category, Transaction } from '@/types'
import { formatMonthLabel, isInMonth } from '@/utils/date'
import { DEFAULT_SORT, filterTransactions, getDefaultDate, sortTransactions } from '../utils'
import { TransactionFilters } from './transaction-filters'
import { TransactionFormDialog } from './transaction-form-dialog'
import { TransactionList } from './transaction-list'

const monthRoute = getRouteApi('/')

type TransactionsSectionProps = {
  month: string
  transactions: Transaction[]
  categories: Category[]
}

type FormState = {
  open: boolean
  transaction: Transaction | null
}

function countLabel(count: number): string {
  return `${count} ${count === 1 ? 'transaction' : 'transactions'}`
}

export function TransactionsSection({ month, transactions, categories }: TransactionsSectionProps) {
  const { category, type, q, sort } = monthRoute.useSearch()
  const [form, setForm] = useState<FormState>({ open: false, transaction: null })
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const categoryId = categories.some((item) => item.id === category) ? category : undefined
  const monthTransactions = transactions.filter((transaction) => isInMonth(transaction.date, month))
  const visibleTransactions = sortTransactions(
    filterTransactions(monthTransactions, { categoryId, type, search: q }),
    sort ?? DEFAULT_SORT,
  )
  const isFiltered = visibleTransactions.length !== monthTransactions.length

  let content: ReactNode
  if (monthTransactions.length === 0) {
    content = (
      <EmptyMessage
        title={`No transactions in ${formatMonthLabel(month)}`}
        description="Add a transaction, or go to another month."
      />
    )
  } else if (visibleTransactions.length === 0) {
    content = (
      <EmptyMessage
        title="No transactions match your filters"
        description="Change the search text or filters, or clear all filters."
      />
    )
  } else {
    content = (
      <TransactionList
        transactions={visibleTransactions}
        categories={categories}
        onEdit={(transaction) => setForm({ open: true, transaction })}
      />
    )
  }

  return (
    <section aria-labelledby="transactions-heading" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="transactions-heading" className="text-xl font-semibold">
            Transactions
          </h2>
          <p role="status" className="text-sm text-muted-foreground">
            {isFiltered && `${visibleTransactions.length} of `}
            {countLabel(monthTransactions.length)}
          </p>
        </div>
        <Button ref={addButtonRef} onClick={() => setForm({ open: true, transaction: null })}>
          <Plus aria-hidden="true" />
          Add transaction
        </Button>
      </div>
      <TransactionFilters categories={categories} categoryId={categoryId} />
      {content}

      <TransactionFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((previous) => ({ ...previous, open }))}
        transaction={form.transaction}
        categories={categories}
        defaultDate={getDefaultDate(month)}
        fallbackFocusRef={addButtonRef}
      />
    </section>
  )
}
