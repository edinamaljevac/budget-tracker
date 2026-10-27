import type { Budget, Category } from '@/types'

export function getCategoriesWithoutBudget(
  categories: Category[],
  budgets: Budget[],
  month: string,
): Category[] {
  const budgetedIds = new Set(
    budgets.filter((budget) => budget.month === month).map((budget) => budget.category_id),
  )
  return categories.filter((category) => !budgetedIds.has(category.id))
}
