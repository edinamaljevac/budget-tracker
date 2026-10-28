import { budgetDataSchema } from '@/types'
import seedData from './budget-data.json'

describe('budget-data.json', () => {
  const data = budgetDataSchema.parse(seedData)

  it('has unique category and transaction ids', () => {
    const categoryIds = data.categories.map((category) => category.id)
    const transactionIds = data.transactions.map((transaction) => transaction.id)

    expect(new Set(categoryIds).size).toBe(categoryIds.length)
    expect(new Set(transactionIds).size).toBe(transactionIds.length)
  })

  it('has unique category names, ignoring case', () => {
    const names = data.categories.map((category) => category.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it('only refers to existing categories', () => {
    const categoryIds = new Set(data.categories.map((category) => category.id))
    const usedIds = [...data.transactions, ...data.budgets].map((item) => item.category_id)

    expect(usedIds.every((id) => categoryIds.has(id))).toBe(true)
  })

  it('has at most one budget per category per month', () => {
    const keys = data.budgets.map((budget) => `${budget.month}:${budget.category_id}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('budgetDataSchema', () => {
  it('ignores fields that are not in the specification', () => {
    const data = {
      ...seedData,
      categories: [{ id: 1, name: 'Groceries', color: '#2E7D32', icon: 'cart' }],
    }
    expect(budgetDataSchema.parse(data).categories).toEqual([
      { id: 1, name: 'Groceries', color: '#2E7D32' },
    ])
  })

  it('rejects a category without a name', () => {
    const data = { ...seedData, categories: [{ id: 1, color: '#2E7D32' }] }
    expect(budgetDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects an invalid amount', () => {
    const data = {
      ...seedData,
      budgets: [{ month: '2026-10', category_id: 1, amount: '200.001' }],
    }
    expect(budgetDataSchema.safeParse(data).success).toBe(false)
  })
})
