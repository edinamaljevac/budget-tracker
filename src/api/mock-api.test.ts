import seedData from '@/data/budget-data.json'
import { buildTransaction } from '@/test/factories'
import { deleteBudget, getBudgets, saveBudget } from './budget-services'
import { createCategory, deleteCategory, getCategories, updateCategory } from './category-services'
import { API_DELAY_MS, resetData, STORAGE_KEY } from './mock-db'
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
  type TransactionInput,
} from './transaction-services'

const GROCERIES_ID = 1
const GIFTS_ID = 11

async function call<T>(request: Promise<T>): Promise<T> {
  await vi.advanceTimersByTimeAsync(API_DELAY_MS)
  return request
}

async function expectRejection(request: Promise<unknown>, message: string): Promise<void> {
  const assertion = expect(request).rejects.toThrow(message)
  await vi.advanceTimersByTimeAsync(API_DELAY_MS)
  await assertion
}

const newTransaction: TransactionInput = {
  type: 'expense',
  amount: '12.34',
  date: '2026-10-20',
  description: 'Coffee beans',
  category_id: GROCERIES_ID,
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  window.history.replaceState(null, '', '/')
})

describe('loading data', () => {
  it('returns the data from budget-data.json when nothing is saved', async () => {
    expect(await call(getCategories())).toEqual(seedData.categories)
    expect(await call(getTransactions())).toEqual(seedData.transactions)
    expect(await call(getBudgets())).toEqual(seedData.budgets)
  })

  it('takes about 500 ms', async () => {
    let isDone = false
    void getCategories().then(() => {
      isDone = true
    })

    await vi.advanceTimersByTimeAsync(API_DELAY_MS - 1)
    expect(isDone).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(isDone).toBe(true)
  })

  it('fails when the page address contains ?fail=1', async () => {
    window.history.replaceState(null, '', '/?month=2026-10&fail=1')

    await expectRejection(getCategories(), 'Could not load your data')
    await expectRejection(getTransactions(), 'Could not load your data')
    await expectRejection(getBudgets(), 'Could not load your data')
  })

  it('still saves changes when the page address contains ?fail=1', async () => {
    window.history.replaceState(null, '', '/?fail=1')

    await expect(call(createTransaction(newTransaction))).resolves.toMatchObject({
      amount: '12.34',
    })
  })
})

describe('saved data', () => {
  it('keeps changes after a reload', async () => {
    const created = await call(createTransaction(newTransaction))

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(await call(getTransactions())).toContainEqual(created)
  })

  it('goes back to the data from the file after a reset', async () => {
    await call(createTransaction(newTransaction))

    await call(resetData())

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(await call(getTransactions())).toEqual(seedData.transactions)
  })

  it.each([
    ['broken JSON', '{"categories": ['],
    ['data that does not match the schema', JSON.stringify({ categories: [] })],
  ])('reports %s and does not overwrite it', async (_label, savedValue) => {
    localStorage.setItem(STORAGE_KEY, savedValue)

    await expectRejection(getCategories(), "Your saved data can't be read")
    await expectRejection(createTransaction(newTransaction), "Your saved data can't be read")

    expect(localStorage.getItem(STORAGE_KEY)).toBe(savedValue)
  })
})

describe('transactions', () => {
  it('creates a transaction with the next free id', async () => {
    const created = await call(createTransaction(newTransaction))

    expect(created).toEqual({ id: 39, ...newTransaction })
  })

  it('does not create a transaction for a category that does not exist', async () => {
    await expectRejection(
      createTransaction({ ...newTransaction, category_id: 999 }),
      'The selected category does not exist.',
    )
  })

  it('updates a transaction', async () => {
    const updated = buildTransaction({ id: 12, amount: '50.00', description: 'Big weekly shop' })

    await call(updateTransaction(updated))

    expect(await call(getTransactions())).toContainEqual(updated)
  })

  it('deletes a transaction', async () => {
    await call(deleteTransaction(12))

    const ids = (await call(getTransactions())).map((transaction) => transaction.id)
    expect(ids).not.toContain(12)
    expect(ids).toHaveLength(seedData.transactions.length - 1)
  })
})

describe('categories', () => {
  it('creates a category', async () => {
    const created = await call(createCategory({ name: 'Pets', color: '#123456' }))

    expect(created).toEqual({ id: 12, name: 'Pets', color: '#123456' })
  })

  it('does not create a category with a name that exists in another case', async () => {
    await expectRejection(
      createCategory({ name: 'GROCERIES', color: '#123456' }),
      'A category with this name already exists.',
    )
  })

  it('lets a category be renamed to its own name in another case', async () => {
    const renamed = { id: GROCERIES_ID, name: 'GROCERIES', color: '#000000' }

    await expect(call(updateCategory(renamed))).resolves.toEqual(renamed)
  })

  it('does not rename a category to the name of another category', async () => {
    await expectRejection(
      updateCategory({ id: GROCERIES_ID, name: 'rent', color: '#2E7D32' }),
      'A category with this name already exists.',
    )
  })

  it('does not delete a category that has transactions', async () => {
    await expectRejection(
      deleteCategory(GROCERIES_ID),
      'This category has transactions, so it cannot be deleted.',
    )

    const ids = (await call(getCategories())).map((category) => category.id)
    expect(ids).toContain(GROCERIES_ID)
  })

  it('deletes a category together with its budgets in every month', async () => {
    await call(saveBudget({ month: '2026-09', category_id: GIFTS_ID, amount: '25.00' }))

    await call(deleteCategory(GIFTS_ID))

    const categories = await call(getCategories())
    const budgets = await call(getBudgets())
    expect(categories.map((category) => category.id)).not.toContain(GIFTS_ID)
    expect(budgets.filter((budget) => budget.category_id === GIFTS_ID)).toEqual([])
    expect(budgets).toHaveLength(seedData.budgets.length - 1)
  })
})

describe('budgets', () => {
  it('replaces the budget of a category for the same month', async () => {
    await call(saveBudget({ month: '2026-10', category_id: GROCERIES_ID, amount: '250.00' }))

    const budgets = await call(getBudgets())
    const octoberGroceries = budgets.filter(
      (budget) => budget.month === '2026-10' && budget.category_id === GROCERIES_ID,
    )
    expect(octoberGroceries).toEqual([
      { month: '2026-10', category_id: GROCERIES_ID, amount: '250.00' },
    ])
  })

  it('adds a budget for a new month', async () => {
    const budget = { month: '2026-11', category_id: GROCERIES_ID, amount: '180.00' }

    await call(saveBudget(budget))

    expect(await call(getBudgets())).toContainEqual(budget)
  })

  it('removes only the budget of the given month', async () => {
    await call(deleteBudget({ month: '2026-10', category_id: GROCERIES_ID }))

    const groceriesMonths = (await call(getBudgets()))
      .filter((budget) => budget.category_id === GROCERIES_ID)
      .map((budget) => budget.month)
    expect(groceriesMonths).toEqual(['2026-08', '2026-09'])
  })

  it('does not save a budget for a category that does not exist', async () => {
    await expectRejection(
      saveBudget({ month: '2026-10', category_id: 999, amount: '10.00' }),
      'The selected category does not exist.',
    )
  })
})
