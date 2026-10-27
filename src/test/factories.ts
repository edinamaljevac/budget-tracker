import type { Budget, Category, Transaction } from '@/types'

export function buildCategory(overrides: Partial<Category> = {}): Category {
  return { id: 1, name: 'Groceries', color: '#2E7D32', ...overrides }
}

export function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    type: 'expense',
    amount: '10.00',
    date: '2026-10-03',
    description: 'Weekly shopping',
    category_id: 1,
    ...overrides,
  }
}

export function buildBudget(overrides: Partial<Budget> = {}): Budget {
  return { month: '2026-10', category_id: 1, amount: '200.00', ...overrides }
}
