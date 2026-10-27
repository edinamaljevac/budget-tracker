import { buildBudget, buildCategory } from '@/test/factories'
import { getCategoriesWithoutBudget } from './utils'

const groceries = buildCategory({ id: 1, name: 'Groceries' })
const rent = buildCategory({ id: 2, name: 'Rent' })
const travel = buildCategory({ id: 3, name: 'Travel' })

describe('getCategoriesWithoutBudget', () => {
  it('leaves out categories that have a budget in the given month', () => {
    const budgets = [
      buildBudget({ month: '2026-10', category_id: 1 }),
      buildBudget({ month: '2026-09', category_id: 2 }),
    ]

    expect(getCategoriesWithoutBudget([groceries, rent, travel], budgets, '2026-10')).toEqual([
      rent,
      travel,
    ])
  })

  it('returns no categories when every category has a budget', () => {
    const budgets = [
      buildBudget({ month: '2026-10', category_id: 1 }),
      buildBudget({ month: '2026-10', category_id: 2 }),
    ]

    expect(getCategoriesWithoutBudget([groceries, rent], budgets, '2026-10')).toEqual([])
  })
})
