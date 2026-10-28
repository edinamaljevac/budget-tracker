import { screen } from '@testing-library/react'
import { renderApp } from '@/test/render-app'
import type { BudgetData } from '@/types'
import { getCategories } from './category-services'
import { resetData, STORAGE_KEY } from './mock-db'

vi.mock('@/data/budget-data.json', () => ({
  default: {
    categories: [{ id: 1, name: 'Groceries', color: 'green' }],
    transactions: [],
    budgets: [],
  },
}))

const INVALID_FILE_MESSAGE =
  "The starting data in budget-data.json is not valid, so it can't be loaded."

const savedData: BudgetData = {
  categories: [{ id: 1, name: 'Groceries', color: '#2E7D32' }],
  transactions: [],
  budgets: [],
}

describe('budget-data.json that is not valid', () => {
  it('shows the error and a way to try again instead of a blank page', async () => {
    renderApp('/?month=2026-10')

    expect(await screen.findByRole('alert')).toHaveTextContent(INVALID_FILE_MESSAGE)
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('still loads the saved data', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData))

    expect(await getCategories()).toEqual(savedData.categories)
  })

  it('does not reset the saved data', async () => {
    const savedValue = JSON.stringify(savedData)
    localStorage.setItem(STORAGE_KEY, savedValue)

    await expect(resetData()).rejects.toThrow(INVALID_FILE_MESSAGE)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(savedValue)
  })
})
