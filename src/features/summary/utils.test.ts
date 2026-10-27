import { buildBudget, buildCategory, buildTransaction } from '@/test/factories'
import { calculateMonthlySummary, getBudgetStatus } from './utils'

const groceries = buildCategory({ id: 1, name: 'Groceries' })
const transport = buildCategory({ id: 2, name: 'Transport' })
const salary = buildCategory({ id: 3, name: 'Salary' })
const gifts = buildCategory({ id: 4, name: 'Gifts' })
const categories = [groceries, transport, salary, gifts]

describe('getBudgetStatus', () => {
  it('shows the amount left when under budget', () => {
    expect(getBudgetStatus(15_000, 20_000)).toEqual({
      budgetCents: 20_000,
      spentCents: 15_000,
      remainingCents: 5_000,
      isOver: false,
    })
  })

  it('is not over budget when spending equals the budget', () => {
    const status = getBudgetStatus(20_000, 20_000)
    expect(status.isOver).toBe(false)
    expect(status.remainingCents).toBe(0)
  })

  it('is over budget by one cent', () => {
    const status = getBudgetStatus(20_001, 20_000)
    expect(status.isOver).toBe(true)
    expect(status.remainingCents).toBe(-1)
  })

  it('keeps the full budget when nothing is spent', () => {
    expect(getBudgetStatus(0, 5_000)).toMatchObject({ remainingCents: 5_000, isOver: false })
  })
})

describe('calculateMonthlySummary', () => {
  it('returns zero totals and no categories for an empty month', () => {
    expect(calculateMonthlySummary('2026-10', [], categories, [])).toEqual({
      incomeCents: 0,
      expenseCents: 0,
      balanceCents: 0,
      categories: [],
    })
  })

  it('calculates exact income, expense and balance totals', () => {
    const transactions = [
      buildTransaction({ id: 1, type: 'income', amount: '2450.00', category_id: 3 }),
      buildTransaction({ id: 2, amount: '0.10' }),
      buildTransaction({ id: 3, amount: '0.20' }),
      buildTransaction({ id: 4, amount: '45.10' }),
    ]

    const summary = calculateMonthlySummary('2026-10', transactions, categories, [])

    expect(summary.incomeCents).toBe(245_000)
    expect(summary.expenseCents).toBe(4_540)
    expect(summary.balanceCents).toBe(240_460)
  })

  it('allows a negative balance', () => {
    const transactions = [
      buildTransaction({ id: 1, type: 'income', amount: '100.00', category_id: 3 }),
      buildTransaction({ id: 2, amount: '150.25' }),
    ]

    expect(calculateMonthlySummary('2026-10', transactions, categories, []).balanceCents).toBe(
      -5_025,
    )
  })

  it('ignores transactions and budgets from other months', () => {
    const transactions = [
      buildTransaction({ id: 1, amount: '10.00', date: '2026-09-30' }),
      buildTransaction({ id: 2, amount: '20.00', date: '2026-10-01' }),
      buildTransaction({ id: 3, amount: '30.00', date: '2026-10-31' }),
      buildTransaction({ id: 4, amount: '40.00', date: '2026-11-01' }),
    ]
    const budgets = [buildBudget({ month: '2026-09', category_id: 2 })]

    const summary = calculateMonthlySummary('2026-10', transactions, categories, budgets)

    expect(summary.expenseCents).toBe(5_000)
    expect(summary.categories.map((row) => row.category.name)).toEqual(['Groceries'])
  })

  it('does not count income as category spending', () => {
    const transactions = [
      buildTransaction({ id: 1, type: 'income', amount: '500.00', category_id: 1 }),
      buildTransaction({ id: 2, amount: '20.00', category_id: 1 }),
    ]

    const [row] = calculateMonthlySummary('2026-10', transactions, categories, []).categories

    expect(row.spentCents).toBe(2_000)
  })

  it('lists categories with an expense or a budget, highest expense first', () => {
    const transactions = [
      buildTransaction({ id: 1, amount: '20.00', category_id: 1 }),
      buildTransaction({ id: 2, amount: '35.00', category_id: 2 }),
      buildTransaction({ id: 3, type: 'income', amount: '900.00', category_id: 3 }),
    ]
    const budgets = [buildBudget({ category_id: 4, amount: '50.00' })]

    const rows = calculateMonthlySummary('2026-10', transactions, categories, budgets).categories

    expect(rows.map((row) => [row.category.name, row.spentCents])).toEqual([
      ['Transport', 3_500],
      ['Groceries', 2_000],
      ['Gifts', 0],
    ])
  })

  it('orders categories with equal spending by name', () => {
    const transactions = [
      buildTransaction({ id: 1, amount: '10.00', category_id: 2 }),
      buildTransaction({ id: 2, amount: '10.00', category_id: 1 }),
    ]

    const rows = calculateMonthlySummary('2026-10', transactions, categories, []).categories

    expect(rows.map((row) => row.category.name)).toEqual(['Groceries', 'Transport'])
  })

  it('adds budget status only to categories that have a budget', () => {
    const transactions = [
      buildTransaction({ id: 1, amount: '260.25', category_id: 1 }),
      buildTransaction({ id: 2, amount: '12.00', category_id: 2 }),
    ]
    const budgets = [buildBudget({ category_id: 1, amount: '200.00' })]

    const [groceriesRow, transportRow] = calculateMonthlySummary(
      '2026-10',
      transactions,
      categories,
      budgets,
    ).categories

    expect(groceriesRow.budget).toEqual({
      budgetCents: 20_000,
      spentCents: 26_025,
      remainingCents: -6_025,
      isOver: true,
    })
    expect(transportRow.budget).toBeNull()
  })

  it('matches a budget exactly when cent amounts add up to it', () => {
    const transactions = [
      buildTransaction({ id: 1, amount: '49.90', category_id: 2 }),
      buildTransaction({ id: 2, amount: '0.10', category_id: 2 }),
      buildTransaction({ id: 3, amount: '0.20', category_id: 2 }),
    ]
    const budgets = [buildBudget({ category_id: 2, amount: '50.20' })]

    const [row] = calculateMonthlySummary('2026-10', transactions, categories, budgets).categories

    expect(row.budget).toMatchObject({ remainingCents: 0, isOver: false })
  })
})
