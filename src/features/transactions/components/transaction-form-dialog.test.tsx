import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { STORAGE_KEY } from '@/api/mock-db'
import { createQueryClient } from '@/lib/query-client'
import { buildCategory, buildTransaction } from '@/test/factories'
import { renderApp } from '@/test/render-app'
import type { BudgetData, Transaction } from '@/types'
import { TransactionFormDialog } from './transaction-form-dialog'

const SEED_TRANSACTION_COUNT = 38

function getSavedTransactions() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === null ? [] : (JSON.parse(saved) as BudgetData).transactions
}

async function openMonth() {
  renderApp('/?month=2026-10')
  return within(await screen.findByRole('region', { name: 'Transactions' }))
}

async function openAddDialog(user: UserEvent) {
  const transactions = await openMonth()
  await user.click(transactions.getByRole('button', { name: 'Add transaction' }))
  return within(screen.getByRole('dialog', { name: 'Add transaction' }))
}

async function fillValidForm(user: UserEvent, dialog: ReturnType<typeof within>, amount = '10.50') {
  await user.click(dialog.getByLabelText('Expense'))
  await user.type(dialog.getByLabelText('Amount (€)'), amount)
  await user.clear(dialog.getByLabelText('Date'))
  await user.type(dialog.getByLabelText('Date'), '2026-10-20')
  await user.click(dialog.getByRole('combobox', { name: 'Category' }))
  await user.click(screen.getByRole('option', { name: 'Groceries' }))
  await user.type(dialog.getByLabelText('Description (optional)'), 'Bakery')
}

describe('adding a transaction', () => {
  it('shows each error next to its field and saves nothing', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)

    await user.clear(dialog.getByLabelText('Date'))
    await user.click(dialog.getByLabelText('Description (optional)'))
    await user.paste('a'.repeat(201))
    await user.click(dialog.getByRole('button', { name: 'Add transaction' }))

    expect(dialog.getByRole('radiogroup', { name: 'Type' })).toHaveAccessibleDescription(
      'Choose income or expense.',
    )
    expect(dialog.getByLabelText('Amount (€)')).toHaveAccessibleDescription('Enter an amount.')
    expect(dialog.getByLabelText('Date')).toHaveAccessibleDescription('Enter a date.')
    expect(dialog.getByRole('combobox', { name: 'Category' })).toHaveAccessibleDescription(
      'Choose a category.',
    )
    expect(dialog.getByLabelText('Description (optional)')).toHaveAccessibleDescription(
      'Use 200 characters or fewer.',
    )
    expect(getSavedTransactions()).toHaveLength(0)
  })

  it('adds the transaction with a comma as the decimal mark, and the list and summary update', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)

    await fillValidForm(user, dialog, '10,50')
    await user.click(dialog.getByRole('button', { name: 'Add transaction' }))

    expect(dialog.getByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(dialog.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(await screen.findByText('Transaction added')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Edit transaction: Bakery, Oct 20, Groceries, expense -10.50 €',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Totals' })).toHaveTextContent('Balance267.11 €')
    expect(getSavedTransactions()).toContainEqual(
      expect.objectContaining({ amount: '10.50', description: 'Bakery', category_id: 1 }),
    )
  })

  it('explains that a category is needed when there are none, and links to the categories', async () => {
    const user = userEvent.setup()
    const emptyData: BudgetData = { categories: [], transactions: [], budgets: [] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData))
    const dialog = await openAddDialog(user)

    expect(dialog.getByRole('combobox', { name: 'Category' })).toBeDisabled()
    expect(dialog.getByText(/A transaction needs a category/)).toBeInTheDocument()

    await user.click(dialog.getByLabelText('Expense'))
    await user.type(dialog.getByLabelText('Amount (€)'), '10.50')
    await user.click(dialog.getByRole('button', { name: 'Add transaction' }))

    expect(dialog.getByRole('combobox', { name: 'Category' })).toHaveAccessibleDescription(
      'Choose a category.',
    )
    expect(getSavedTransactions()).toHaveLength(0)

    await user.click(dialog.getByRole('link', { name: 'Add a category' }))

    expect(await screen.findByRole('heading', { name: 'Categories' })).toBeInTheDocument()
  })

  it('saves once when the user double-clicks the button', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)

    await fillValidForm(user, dialog)
    await user.dblClick(dialog.getByRole('button', { name: 'Add transaction' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(getSavedTransactions()).toHaveLength(SEED_TRANSACTION_COUNT + 1)
  })

  it('saves once when the user presses Enter twice', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)

    await fillValidForm(user, dialog)
    await user.keyboard('{Enter}{Enter}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(getSavedTransactions()).toHaveLength(SEED_TRANSACTION_COUNT + 1)
  })
})

describe('editing a transaction', () => {
  it('saves the changes, and the summary updates', async () => {
    const user = userEvent.setup()
    const transactions = await openMonth()

    await user.click(transactions.getByRole('button', { name: /^Edit transaction: Monthly rent,/ }))
    const dialog = within(screen.getByRole('dialog', { name: 'Edit transaction' }))
    expect(dialog.getByLabelText('Amount (€)')).toHaveValue('850.00')

    await user.clear(dialog.getByLabelText('Amount (€)'))
    await user.type(dialog.getByLabelText('Amount (€)'), '900')
    await user.click(dialog.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Changes saved')).toBeInTheDocument()
    expect(
      transactions.getByRole('button', { name: /^Edit transaction: Monthly rent,/ }),
    ).toHaveTextContent('-900.00 €')
    expect(screen.getByRole('region', { name: 'Totals' })).toHaveTextContent('Expenses-2,632.39 €')
    await waitFor(() =>
      expect(
        transactions.getByRole('button', { name: /^Edit transaction: Monthly rent,/ }),
      ).toHaveFocus(),
    )
  })

  it('moves focus to the add button when the edited transaction leaves the month', async () => {
    const user = userEvent.setup()
    const transactions = await openMonth()

    await user.click(transactions.getByRole('button', { name: /^Edit transaction: Monthly rent,/ }))
    const dialog = within(screen.getByRole('dialog', { name: 'Edit transaction' }))
    await user.clear(dialog.getByLabelText('Date'))
    await user.type(dialog.getByLabelText('Date'), '2026-09-30')
    await user.click(dialog.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Changes saved')).toBeInTheDocument()
    expect(
      transactions.queryByRole('button', { name: /^Edit transaction: Monthly rent,/ }),
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(transactions.getByRole('button', { name: 'Add transaction' })).toHaveFocus(),
    )
  })

  it('shows the values of the transaction it is given, even while it stays open', () => {
    const transaction = buildTransaction({ amount: '850.00', description: 'Monthly rent' })
    const queryClient = createQueryClient()
    const renderDialog = (current: Transaction | null) => (
      <QueryClientProvider client={queryClient}>
        <TransactionFormDialog
          open
          onOpenChange={() => {}}
          transaction={current}
          categories={[buildCategory()]}
          defaultDate="2026-10-01"
          fallbackFocusRef={{ current: null }}
        />
      </QueryClientProvider>
    )
    const { rerender } = render(renderDialog(transaction))
    expect(screen.getByLabelText('Amount (€)')).toHaveValue('850.00')

    rerender(renderDialog(null))

    expect(screen.getByRole('dialog', { name: 'Add transaction' })).toBeInTheDocument()
    expect(screen.getByLabelText('Amount (€)')).toHaveValue('')
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('')
  })
})

describe('deleting a transaction', () => {
  it('deletes the transaction after the user confirms', async () => {
    const user = userEvent.setup()
    const transactions = await openMonth()

    await user.click(transactions.getByRole('button', { name: /^Edit transaction: Monthly rent,/ }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const confirmation = within(
      screen.getByRole('alertdialog', { name: 'Delete this transaction?' }),
    )
    expect(confirmation.getByText(/Monthly rent, Oct 2, 850.00 €/)).toBeInTheDocument()

    await user.click(confirmation.getByRole('button', { name: 'Delete transaction' }))

    expect(await screen.findByText('Transaction deleted')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      transactions.queryByRole('button', { name: /^Edit transaction: Monthly rent,/ }),
    ).not.toBeInTheDocument()
    expect(getSavedTransactions()).toHaveLength(SEED_TRANSACTION_COUNT - 1)
    await waitFor(() =>
      expect(transactions.getByRole('button', { name: 'Add transaction' })).toHaveFocus(),
    )
  })
})
