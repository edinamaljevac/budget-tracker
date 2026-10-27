import { budgetFormSchema } from './schema'

function getMessages(values: { category_id?: string; amount?: string }) {
  const result = budgetFormSchema.safeParse({ category_id: '1', amount: '200', ...values })
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join('.'), issue.message]),
  )
}

describe('budgetFormSchema', () => {
  it('turns valid form values into a category id and a saved amount', () => {
    expect(budgetFormSchema.parse({ category_id: '4', amount: '50,2' })).toEqual({
      category_id: 4,
      amount: '50.20',
    })
  })

  it('accepts the largest allowed amount', () => {
    expect(getMessages({ amount: '1000000.00' })).toEqual({})
  })

  it.each([
    ['category_id', '', 'Choose a category.'],
    ['amount', '', 'Enter an amount.'],
    ['amount', '0', 'Enter an amount greater than 0.'],
    ['amount', '0.001', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['amount', '12.345', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['amount', '1000000.01', 'Enter an amount of 1,000,000.00 or less.'],
  ])('rejects %s %j', (field, value, message) => {
    expect(getMessages({ [field]: value })).toEqual({ [field]: message })
  })
})
