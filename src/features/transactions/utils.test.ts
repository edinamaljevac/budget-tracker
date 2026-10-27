import { buildTransaction } from '@/test/factories'
import { filterTransactions, getDefaultDate, getInitialMonth, sortTransactions } from './utils'

const rent = buildTransaction({
  id: 1,
  amount: '850.00',
  date: '2026-10-02',
  description: 'Monthly rent',
  category_id: 2,
})
const shopping = buildTransaction({
  id: 2,
  amount: '45.10',
  date: '2026-10-03',
  description: 'Weekly SHOPPING',
})
const salary = buildTransaction({
  id: 3,
  type: 'income',
  amount: '2450.00',
  date: '2026-10-01',
  description: 'Salary',
  category_id: 3,
})
const noDescription = buildTransaction({
  id: 4,
  amount: '58.30',
  date: '2026-10-03',
  description: null,
})
const transactions = [rent, shopping, salary, noDescription]

const ids = (list: { id: number }[]) => list.map((transaction) => transaction.id)

describe('filterTransactions', () => {
  it('returns all transactions without filters', () => {
    expect(filterTransactions(transactions, {})).toEqual(transactions)
  })

  it('filters by category', () => {
    expect(ids(filterTransactions(transactions, { categoryId: 1 }))).toEqual([2, 4])
  })

  it('filters by type', () => {
    expect(ids(filterTransactions(transactions, { type: 'income' }))).toEqual([3])
  })

  it('searches the description ignoring upper and lower case', () => {
    expect(ids(filterTransactions(transactions, { search: 'shop' }))).toEqual([2])
    expect(ids(filterTransactions(transactions, { search: 'MONTHLY' }))).toEqual([1])
  })

  it('ignores spaces around the search text', () => {
    expect(ids(filterTransactions(transactions, { search: '  rent  ' }))).toEqual([1])
  })

  it('does not match transactions without a description', () => {
    expect(ids(filterTransactions(transactions, { search: 'a' }))).not.toContain(4)
  })

  it('combines all filters', () => {
    expect(
      ids(filterTransactions(transactions, { categoryId: 1, type: 'expense', search: 'weekly' })),
    ).toEqual([2])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterTransactions(transactions, { search: 'holiday' })).toEqual([])
  })
})

describe('sortTransactions', () => {
  it('sorts newest first, and newer entries first on the same date', () => {
    expect(ids(sortTransactions(transactions, 'date-desc'))).toEqual([4, 2, 1, 3])
  })

  it('sorts oldest first', () => {
    expect(ids(sortTransactions(transactions, 'date-asc'))).toEqual([3, 1, 2, 4])
  })

  it('sorts by highest amount', () => {
    expect(ids(sortTransactions(transactions, 'amount-desc'))).toEqual([3, 1, 4, 2])
  })

  it('sorts by lowest amount', () => {
    expect(ids(sortTransactions(transactions, 'amount-asc'))).toEqual([2, 4, 1, 3])
  })

  it('does not change the original list', () => {
    sortTransactions(transactions, 'amount-asc')
    expect(ids(transactions)).toEqual([1, 2, 3, 4])
  })
})

describe('getInitialMonth', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the month of the newest transaction', () => {
    const older = buildTransaction({ id: 5, date: '2025-12-31' })
    const newest = buildTransaction({ id: 6, date: '2026-01-02' })

    expect(getInitialMonth([newest, older])).toBe('2026-01')
  })

  it('returns the current month when there are no transactions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2027, 2, 15))

    expect(getInitialMonth([])).toBe('2027-03')
  })
})

describe('getDefaultDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 7))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns today for the current month', () => {
    expect(getDefaultDate('2026-10')).toBe('2026-10-07')
  })

  it('returns the first day of any other month', () => {
    expect(getDefaultDate('2026-08')).toBe('2026-08-01')
  })
})
