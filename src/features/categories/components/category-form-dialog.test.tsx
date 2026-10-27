import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/render-app'

async function openCategories() {
  renderApp('/categories')
  return within(await screen.findByRole('region', { name: 'Category list' }))
}

describe('categories page', () => {
  it('shows the name error next to its field, then adds the category', async () => {
    const user = userEvent.setup()
    const list = await openCategories()

    await user.click(list.getByRole('button', { name: 'Add category' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Add category' }))
    await user.type(dialog.getByLabelText('Name'), 'GROCERIES')
    await user.click(dialog.getByRole('button', { name: 'Add category' }))

    expect(dialog.getByLabelText('Name')).toHaveAccessibleDescription(
      'A category with this name already exists.',
    )

    await user.clear(dialog.getByLabelText('Name'))
    await user.type(dialog.getByLabelText('Name'), '  Pets ')
    await user.click(dialog.getByRole('button', { name: 'Add category' }))

    expect(await screen.findByText('Category added')).toBeInTheDocument()
    expect(
      list.getByRole('button', { name: 'Edit category: Pets, No transactions' }),
    ).toBeInTheDocument()
  })

  it('explains why a category with transactions cannot be deleted', async () => {
    const user = userEvent.setup()
    const list = await openCategories()

    await user.click(
      list.getByRole('button', { name: 'Edit category: Groceries, 10 transactions' }),
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const alert = within(screen.getByRole('alertdialog', { name: 'Groceries cannot be deleted' }))
    expect(
      alert.getByText(
        'It has 10 transactions. Delete them or move them to another category first.',
      ),
    ).toBeInTheDocument()
    expect(alert.queryByRole('button', { name: 'Delete category' })).not.toBeInTheDocument()
  })

  it('deletes a category without transactions after confirmation', async () => {
    const user = userEvent.setup()
    const list = await openCategories()

    await user.click(list.getByRole('button', { name: 'Edit category: Gifts, No transactions' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(
      within(screen.getByRole('alertdialog', { name: 'Delete Gifts?' })).getByRole('button', {
        name: 'Delete category',
      }),
    )

    expect(await screen.findByText('Category deleted')).toBeInTheDocument()
    expect(list.queryByRole('button', { name: /^Edit category: Gifts/ })).not.toBeInTheDocument()
    await waitFor(() => expect(list.getByRole('button', { name: 'Add category' })).toHaveFocus())
  })
})

describe('resetting the data', () => {
  it('goes back to the data from the file after confirmation', async () => {
    const user = userEvent.setup()
    const list = await openCategories()
    await user.click(list.getByRole('button', { name: 'Edit category: Gifts, No transactions' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete category' }))
    await screen.findByText('Category deleted')

    await user.click(screen.getByRole('button', { name: 'Reset data' }))
    await user.click(
      within(screen.getByRole('alertdialog', { name: 'Reset all data?' })).getByRole('button', {
        name: 'Reset data',
      }),
    )

    expect(await screen.findByText('Data reset')).toBeInTheDocument()
    expect(
      await list.findByRole('button', { name: 'Edit category: Gifts, No transactions' }),
    ).toBeInTheDocument()
  })
})
