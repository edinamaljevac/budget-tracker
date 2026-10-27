import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEY } from '@/api/mock-db'
import { renderApp } from '@/test/render-app'

async function findTransactionRows() {
  const section = await screen.findByRole('region', { name: 'Transactions' })
  return within(section).queryAllByRole('listitem')
}

function getTotals() {
  return screen.getByRole('region', { name: 'Totals' })
}

function getCategorySpending() {
  return screen.getByRole('region', { name: 'Spending by category' })
}

describe('month view', () => {
  it('shows the exact totals for the whole month', async () => {
    renderApp('/?month=2026-10')

    expect(await findTransactionRows()).toHaveLength(15)
    expect(getTotals()).toHaveTextContent('Balance277.61 €')
    expect(getTotals()).toHaveTextContent('Income+2,860.00 €')
    expect(getTotals()).toHaveTextContent('Expenses-2,582.39 €')
  })

  it('changes the list but not the summary when the user filters', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/?month=2026-10')
    await findTransactionRows()
    const totalsBefore = getTotals().textContent
    const spendingBefore = getCategorySpending().textContent

    await user.type(screen.getByLabelText('Search descriptions'), 'SHOPPING')

    expect(await findTransactionRows()).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('3 of 15 transactions')
    expect(router.state.location.search).toEqual({ month: '2026-10', q: 'SHOPPING' })
    expect(getTotals().textContent).toBe(totalsBefore)
    expect(getCategorySpending().textContent).toBe(spendingBefore)
  })

  it('shows the search text of the earlier page when the user goes back', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/?month=2026-10')
    await findTransactionRows()

    await user.type(screen.getByLabelText('Search descriptions'), 'weekly')
    await user.click(screen.getByRole('combobox', { name: 'Type' }))
    await user.click(screen.getByRole('option', { name: 'Expenses' }))
    await user.type(screen.getByLabelText('Search descriptions'), ' shopping')
    router.history.back()

    await waitFor(() => expect(screen.getByLabelText('Search descriptions')).toHaveValue('weekly'))
    expect(router.state.location.search).toEqual({ month: '2026-10', q: 'weekly' })
  })

  it('shows over budget and an exactly used budget in text', async () => {
    renderApp('/?month=2026-10')
    await findTransactionRows()
    const spending = getCategorySpending()

    expect(spending).toHaveTextContent('60.25 € over budget')
    expect(spending).toHaveTextContent('0.00 € left')
    expect(
      within(spending).getByRole('progressbar', { name: 'Groceries budget used' }),
    ).toHaveAttribute('aria-valuetext', '260.25 € of 200.00 €')
  })

  it('shows a message for a month without transactions', async () => {
    renderApp('/?month=2026-07')

    expect(await screen.findByText('No transactions in July 2026')).toBeInTheDocument()
    expect(getCategorySpending()).toHaveTextContent('No expenses or budgets in this month.')
    expect(getTotals()).toHaveTextContent('Balance0.00 €')
  })

  it('ignores a category in the URL that does not exist', async () => {
    renderApp('/?month=2026-10&category=999')

    expect(await findTransactionRows()).toHaveLength(15)
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveTextContent('All categories')
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
  })

  it('shows a message when no transaction matches, and clears all filters', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/?month=2026-10&type=expense&q=nothing-like-this&sort=amount-asc')

    expect(await screen.findByText('No transactions match your filters')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(await findTransactionRows()).toHaveLength(15)
    expect(screen.getByLabelText('Search descriptions')).toHaveValue('')
    expect(router.state.location.search).toEqual({ month: '2026-10', sort: 'amount-asc' })
  })
})

describe('saved data that cannot be read', () => {
  it('shows the error and lets the user reset the data', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, '{not json')
    renderApp('/?month=2026-10')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("Your saved data can't be read")
    await user.click(within(alert).getByRole('button', { name: 'Reset data' }))

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(await findTransactionRows()).toHaveLength(15)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
