import { buildTransaction } from '@/test/factories'
import { countTransactionsByCategory } from './utils'

describe('countTransactionsByCategory', () => {
  it('counts income and expenses of every month per category', () => {
    const counts = countTransactionsByCategory([
      buildTransaction({ id: 1, category_id: 1, date: '2026-09-30' }),
      buildTransaction({ id: 2, category_id: 1, type: 'income' }),
      buildTransaction({ id: 3, category_id: 2 }),
    ])

    expect(counts.get(1)).toBe(2)
    expect(counts.get(2)).toBe(1)
    expect(counts.get(3)).toBeUndefined()
  })
})
