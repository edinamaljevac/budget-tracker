import { isInMonth } from '@/utils/date'
import { toCents } from '@/utils/money'
import type { Budget, Category, Transaction } from '@/types'

export type BudgetStatus = {
  budgetCents: number
  spentCents: number
  remainingCents: number
  isOver: boolean
}

export type CategorySummary = {
  category: Category
  spentCents: number
  budget: BudgetStatus | null
}

export type MonthlySummary = {
  incomeCents: number
  expenseCents: number
  balanceCents: number
  categories: CategorySummary[]
}

export function getBudgetStatus(spentCents: number, budgetCents: number): BudgetStatus {
  return {
    budgetCents,
    spentCents,
    remainingCents: budgetCents - spentCents,
    isOver: spentCents > budgetCents,
  }
}

export function calculateMonthlySummary(
  month: string,
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
): MonthlySummary {
  let incomeCents = 0
  let expenseCents = 0
  const spentByCategory = new Map<number, number>()

  for (const transaction of transactions) {
    if (!isInMonth(transaction.date, month)) continue

    const cents = toCents(transaction.amount)
    if (transaction.type === 'income') {
      incomeCents += cents
      continue
    }

    expenseCents += cents
    const categoryId = transaction.category_id
    spentByCategory.set(categoryId, (spentByCategory.get(categoryId) ?? 0) + cents)
  }

  const budgetByCategory = new Map(
    budgets
      .filter((budget) => budget.month === month)
      .map((budget) => [budget.category_id, toCents(budget.amount)]),
  )

  const categorySummaries = categories
    .filter((category) => spentByCategory.has(category.id) || budgetByCategory.has(category.id))
    .map((category) => {
      const spentCents = spentByCategory.get(category.id) ?? 0
      const budgetCents = budgetByCategory.get(category.id)
      return {
        category,
        spentCents,
        budget: budgetCents === undefined ? null : getBudgetStatus(spentCents, budgetCents),
      }
    })
    .sort((a, b) => b.spentCents - a.spentCents || a.category.name.localeCompare(b.category.name))

  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
    categories: categorySummaries,
  }
}
