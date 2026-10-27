import { transactionFormSchema, type TransactionFormValues } from './schema'

const validValues: TransactionFormValues = {
  type: 'expense',
  amount: '45.1',
  date: '2026-10-03',
  category_id: '1',
  description: '  Weekly shopping  ',
}

function getMessages(values: Partial<Record<keyof TransactionFormValues, unknown>>) {
  const result = transactionFormSchema.safeParse({ ...validValues, ...values })
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path.join('.'), issue.message]),
  )
}

describe('transactionFormSchema', () => {
  it('turns valid form values into data that can be saved', () => {
    expect(transactionFormSchema.parse(validValues)).toEqual({
      type: 'expense',
      amount: '45.10',
      date: '2026-10-03',
      category_id: 1,
      description: 'Weekly shopping',
    })
  })

  it('saves an empty or blank description as null', () => {
    expect(transactionFormSchema.parse({ ...validValues, description: '' }).description).toBeNull()
    expect(
      transactionFormSchema.parse({ ...validValues, description: '   ' }).description,
    ).toBeNull()
  })

  it('accepts a description of exactly 200 characters', () => {
    expect(getMessages({ description: 'a'.repeat(200) })).toEqual({})
  })

  it('accepts the largest allowed amount', () => {
    expect(getMessages({ amount: '1000000.00' })).toEqual({})
  })

  it.each([
    ['type', undefined, 'Choose income or expense.'],
    ['type', 'transfer', 'Choose income or expense.'],
    ['amount', '', 'Enter an amount.'],
    ['amount', '0', 'Enter an amount greater than 0.'],
    ['amount', '0.001', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['amount', '1.234', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['amount', '1000000.01', 'Enter an amount of 1,000,000.00 or less.'],
    ['date', '', 'Enter a date.'],
    ['date', '2026-02-30', 'Enter a valid date.'],
    ['category_id', '', 'Choose a category.'],
    ['description', 'a'.repeat(201), 'Use 200 characters or fewer.'],
  ])('rejects %s %j', (field, value, message) => {
    expect(getMessages({ [field]: value })).toEqual({ [field]: message })
  })
})
