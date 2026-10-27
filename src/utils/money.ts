import { z } from 'zod'

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

const MAX_AMOUNT_CENTS = 100_000_000

const moneyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function toCents(amount: string): number {
  const [euros, fraction = ''] = amount.split('.')
  return Number(euros) * 100 + Number(fraction.padEnd(2, '0'))
}

export function centsToAmount(cents: number): string {
  const euros = Math.floor(cents / 100)
  const rest = cents % 100
  return `${euros}.${String(rest).padStart(2, '0')}`
}

export function isValidAmount(amount: string): boolean {
  if (!AMOUNT_PATTERN.test(amount)) return false

  const cents = toCents(amount)
  return cents > 0 && cents <= MAX_AMOUNT_CENTS
}

export const amountInputSchema = z
  .string()
  .trim()
  .overwrite((amount) => amount.replace(',', '.'))
  .min(1, { error: 'Enter an amount.', abort: true })
  .regex(AMOUNT_PATTERN, {
    error: 'Enter a number with up to 2 decimals, for example 45.10.',
    abort: true,
  })
  .refine((amount) => toCents(amount) > 0, {
    error: 'Enter an amount greater than 0.',
    abort: true,
  })
  .refine((amount) => toCents(amount) <= MAX_AMOUNT_CENTS, {
    error: 'Enter an amount of 1,000,000.00 or less.',
  })
  .transform((amount) => centsToAmount(toCents(amount)))

export function formatMoney(cents: number): string {
  return `${moneyFormatter.format(cents / 100)} €`
}
