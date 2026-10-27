import type { Category, Transaction } from '@/types'
import { TransactionRow } from './transaction-row'

type TransactionListProps = {
  transactions: Transaction[]
  categories: Category[]
  onEdit: (transaction: Transaction) => void
}

export function TransactionList({ transactions, categories, onEdit }: TransactionListProps) {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))

  return (
    <ul className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          category={categoriesById.get(transaction.category_id)}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
