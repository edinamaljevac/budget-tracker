import { render, screen } from '@testing-library/react'
import { buildCategory, buildTransaction } from '@/test/factories'
import { TransactionList } from './transaction-list'

describe('TransactionList', () => {
  it.each([null, '', '   '])('shows "No description" for the description %j', (description) => {
    render(
      <TransactionList
        transactions={[buildTransaction({ description })]}
        categories={[buildCategory()]}
        onEdit={() => {}}
      />,
    )

    expect(screen.getByText('No description')).toBeInTheDocument()
  })
})
