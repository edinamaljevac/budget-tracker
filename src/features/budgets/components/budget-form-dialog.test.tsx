import { screen, waitFor, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { renderApp } from '@/test/render-app'

async function openSpending() {
  renderApp('/?month=2026-10')
  await screen.findByRole('region', { name: 'Transactions' })
  return within(screen.getByRole('region', { name: 'Spending by category' }))
}

async function saveAmount(user: UserEvent, amount: string, submitLabel: string) {
  const dialog = within(screen.getByRole('dialog'))
  await user.clear(dialog.getByLabelText('Budget (€)'))
  await user.type(dialog.getByLabelText('Budget (€)'), amount)
  await user.click(dialog.getByRole('button', { name: submitLabel }))
}

describe('setting a budget', () => {
  it('sets a budget from a category row, and going over it is shown', async () => {
    const user = userEvent.setup()
    const spending = await openSpending()

    await user.click(spending.getByRole('button', { name: 'Set budget for Shopping' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Set budget' }))
    expect(dialog.getByRole('combobox', { name: 'Category' })).toHaveTextContent('Shopping')

    await saveAmount(user, '1000', 'Set budget')

    expect(await screen.findByText('Budget saved')).toBeInTheDocument()
    expect(
      spending.getByRole('button', { name: 'Change Shopping budget, 1,000.00 €' }),
    ).toBeInTheDocument()
    expect(spending.getByText('250.00 € over budget')).toBeInTheDocument()
  })

  it('offers only categories without a budget this month', async () => {
    const user = userEvent.setup()
    const spending = await openSpending()
    expect(spending.queryByText('Travel')).not.toBeInTheDocument()

    await user.click(spending.getByRole('button', { name: 'Set budget' }))
    await user.click(screen.getByRole('combobox', { name: 'Category' }))

    expect(screen.queryByRole('option', { name: 'Groceries' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Gifts' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Travel' }))
    await saveAmount(user, '75,5', 'Set budget')

    expect(await screen.findByText('Budget saved')).toBeInTheDocument()
    expect(
      spending.getByRole('button', { name: 'Change Travel budget, 75.50 €' }),
    ).toBeInTheDocument()
    expect(spending.getByText('75.50 € left')).toBeInTheDocument()
  })

  it('shows each error next to its field', async () => {
    const user = userEvent.setup()
    const spending = await openSpending()

    await user.click(spending.getByRole('button', { name: 'Set budget' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Set budget' }))
    await user.click(dialog.getByRole('button', { name: 'Set budget' }))

    expect(dialog.getByRole('combobox', { name: 'Category' })).toHaveAccessibleDescription(
      'Choose a category.',
    )
    expect(dialog.getByLabelText('Budget (€)')).toHaveAccessibleDescription('Enter an amount.')
  })
})

describe('changing a budget', () => {
  it('saves the new amount for the same category', async () => {
    const user = userEvent.setup()
    const spending = await openSpending()

    await user.click(spending.getByRole('button', { name: 'Change Groceries budget, 200.00 €' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Change budget' }))
    expect(dialog.getByText('Groceries, October 2026')).toBeInTheDocument()
    expect(dialog.queryByRole('combobox')).not.toBeInTheDocument()
    expect(dialog.getByLabelText('Budget (€)')).toHaveValue('200.00')

    await saveAmount(user, '300', 'Save budget')

    expect(await screen.findByText('Budget saved')).toBeInTheDocument()
    expect(spending.getByText('39.75 € left')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        spending.getByRole('button', { name: 'Change Groceries budget, 300.00 €' }),
      ).toHaveFocus(),
    )
  })
})

describe('removing a budget', () => {
  it('removes a budget after confirmation, and a category without expenses leaves the list', async () => {
    const user = userEvent.setup()
    const spending = await openSpending()

    await user.click(spending.getByRole('button', { name: 'Change Gifts budget, 50.00 €' }))
    await user.click(screen.getByRole('button', { name: 'Remove budget' }))
    const confirmation = within(
      screen.getByRole('alertdialog', { name: 'Remove the Gifts budget?' }),
    )
    await user.click(confirmation.getByRole('button', { name: 'Remove budget' }))

    expect(await screen.findByText('Budget removed')).toBeInTheDocument()
    expect(spending.queryByText('Gifts')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(spending.getByRole('heading', { name: 'Spending by category' })).toHaveFocus(),
    )
  })

  it('keeps a category with expenses in the list and returns focus to its budget button', async () => {
    const user = userEvent.setup()
    const spending = await openSpending()

    await user.click(spending.getByRole('button', { name: 'Change Groceries budget, 200.00 €' }))
    await user.click(screen.getByRole('button', { name: 'Remove budget' }))
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove budget' }),
    )

    expect(await screen.findByText('Budget removed')).toBeInTheDocument()
    expect(spending.queryByText('60.25 € over budget')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(spending.getByRole('button', { name: 'Set budget for Groceries' })).toHaveFocus(),
    )
  })
})
