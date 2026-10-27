import { getRouteApi, Navigate } from '@tanstack/react-router'
import { useBudgets } from '@/api/budget-queries'
import { useCategories } from '@/api/category-queries'
import { useTransactions } from '@/api/transaction-queries'
import { getInitialMonth } from '@/features/transactions/utils'
import { MonthView } from './month-view'

const monthRoute = getRouteApi('/')

export function MonthContent() {
  const { month } = monthRoute.useSearch()
  const { data: transactions } = useTransactions()
  const { data: categories } = useCategories()
  const { data: budgets } = useBudgets()

  if (month === undefined) {
    return (
      <Navigate
        to="/"
        search={(previous) => ({ ...previous, month: getInitialMonth(transactions) })}
        replace
      />
    )
  }

  return (
    <MonthView
      month={month}
      transactions={transactions}
      categories={categories}
      budgets={budgets}
    />
  )
}
