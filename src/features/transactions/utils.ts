import { getCurrentMonth, getToday, isInMonth, monthOf } from '@/utils/date'
import { toCents } from '@/utils/money'
import type { Transaction, TransactionType } from '@/types'

export const TRANSACTION_SORTS = ['date-desc', 'date-asc', 'amount-desc', 'amount-asc'] as const

export type TransactionSort = (typeof TRANSACTION_SORTS)[number]

export const DEFAULT_SORT: TransactionSort = 'date-desc'

export type TransactionFilters = {
  categoryId?: number
  type?: TransactionType
  search?: string
}

type Comparator = (a: Transaction, b: Transaction) => number

const newestFirst: Comparator = (a, b) => b.date.localeCompare(a.date) || b.id - a.id

const comparators: Record<TransactionSort, Comparator> = {
  'date-desc': newestFirst,
  'date-asc': (a, b) => newestFirst(b, a),
  'amount-desc': (a, b) => toCents(b.amount) - toCents(a.amount) || newestFirst(a, b),
  'amount-asc': (a, b) => toCents(a.amount) - toCents(b.amount) || newestFirst(a, b),
}

export function filterTransactions(
  transactions: Transaction[],
  { categoryId, type, search }: TransactionFilters,
): Transaction[] {
  const query = search?.trim().toLowerCase() ?? ''

  return transactions.filter(
    (transaction) =>
      (categoryId === undefined || transaction.category_id === categoryId) &&
      (type === undefined || transaction.type === type) &&
      (query === '' || (transaction.description?.toLowerCase().includes(query) ?? false)),
  )
}

export function sortTransactions(
  transactions: Transaction[],
  sort: TransactionSort,
): Transaction[] {
  return transactions.toSorted(comparators[sort])
}

export function getInitialMonth(transactions: Transaction[]): string {
  const [newest] = sortTransactions(transactions, 'date-desc')
  return newest ? monthOf(newest.date) : getCurrentMonth()
}

export function getDefaultDate(month: string): string {
  const today = getToday()
  return isInMonth(today, month) ? today : `${month}-01`
}
