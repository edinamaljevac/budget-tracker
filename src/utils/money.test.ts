import { amountInputSchema, centsToAmount, formatMoney, isValidAmount, toCents } from './money'

describe('toCents', () => {
  it.each([
    ['45.10', 4510],
    ['45.1', 4510],
    ['7', 700],
    ['0.01', 1],
    ['1000000.00', 100_000_000],
  ])('converts %s to %i cents', (amount, cents) => {
    expect(toCents(amount)).toBe(cents)
  })

  it('adds 0.10 and 0.20 to exactly 30 cents', () => {
    expect(toCents('0.10') + toCents('0.20')).toBe(30)
  })

  it('adds 0.10 ten times to exactly 1.00', () => {
    const total = Array.from({ length: 10 }, () => toCents('0.10')).reduce((sum, c) => sum + c, 0)
    expect(centsToAmount(total)).toBe('1.00')
  })
})

describe('centsToAmount', () => {
  it.each([
    [4510, '45.10'],
    [5, '0.05'],
    [700, '7.00'],
    [100_000_000, '1000000.00'],
  ])('converts %i cents to %s', (cents, amount) => {
    expect(centsToAmount(cents)).toBe(amount)
  })
})

describe('isValidAmount', () => {
  it.each(['0.01', '45.1', '45.10', '1000000', '1000000.00'])('accepts %s', (amount) => {
    expect(isValidAmount(amount)).toBe(true)
  })

  it.each([
    '0',
    '0.00',
    '-5',
    '1.234',
    '1000000.01',
    '12,50',
    '1,250.00',
    'abc',
    '',
    ' 5',
    '.5',
    '5.',
  ])('rejects "%s"', (amount) => {
    expect(isValidAmount(amount)).toBe(false)
  })
})

describe('amountInputSchema', () => {
  it.each([
    ['45.1', '45.10'],
    [' 7 ', '7.00'],
    ['007.5', '7.50'],
    ['12,50', '12.50'],
    ['0,5', '0.50'],
    ['0.01', '0.01'],
    ['1000000.00', '1000000.00'],
  ])('accepts "%s" and saves it as %s', (input, saved) => {
    expect(amountInputSchema.parse(input)).toBe(saved)
  })

  it.each([
    ['', 'Enter an amount.'],
    ['   ', 'Enter an amount.'],
    ['abc', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['1.234', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['-5', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['1,250.00', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['1,250,00', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['12,505', 'Enter a number with up to 2 decimals, for example 45.10.'],
    ['0', 'Enter an amount greater than 0.'],
    ['0.00', 'Enter an amount greater than 0.'],
    ['1000000.01', 'Enter an amount of 1,000,000.00 or less.'],
  ])('rejects "%s" with one message', (input, message) => {
    const result = amountInputSchema.safeParse(input)

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([message])
  })
})

describe('formatMoney', () => {
  it.each([
    [125_000, '1,250.00 €'],
    [0, '0.00 €'],
    [5, '0.05 €'],
    [30, '0.30 €'],
    [100_000_000, '1,000,000.00 €'],
    [-550, '-5.50 €'],
    [-125_000, '-1,250.00 €'],
  ])('formats %i cents as %s', (cents, formatted) => {
    expect(formatMoney(cents)).toBe(formatted)
  })
})
