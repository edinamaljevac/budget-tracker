import type { Transaction } from '@/types'

export function countTransactionsByCategory(transactions: Transaction[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const transaction of transactions) {
    counts.set(transaction.category_id, (counts.get(transaction.category_id) ?? 0) + 1)
  }
  return counts
}
