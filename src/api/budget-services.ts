import type { Budget } from '@/types'
import { assertCategoryExists, readData, simulateRequest, writeData } from './mock-db'

type BudgetKey = Pick<Budget, 'month' | 'category_id'>

function isSameBudget(budget: Budget, key: BudgetKey): boolean {
  return budget.month === key.month && budget.category_id === key.category_id
}

export function getBudgets(): Promise<Budget[]> {
  return simulateRequest(() => readData().budgets, { isLoad: true })
}

export function saveBudget(budget: Budget): Promise<Budget> {
  return simulateRequest(() => {
    const data = readData()
    assertCategoryExists(data, budget.category_id)

    data.budgets = data.budgets.filter((existing) => !isSameBudget(existing, budget))
    data.budgets.push(budget)
    writeData(data)
    return budget
  })
}

export function deleteBudget(key: BudgetKey): Promise<void> {
  return simulateRequest(() => {
    const data = readData()
    data.budgets = data.budgets.filter((budget) => !isSameBudget(budget, key))
    writeData(data)
  })
}
