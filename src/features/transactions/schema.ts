import { z } from 'zod'
import { isValidDate } from '@/utils/date'
import { amountInputSchema } from '@/utils/money'
import { transactionTypeSchema } from '@/types'

export const transactionFormSchema = z.object({
  type: z.enum(transactionTypeSchema.options, { error: 'Choose income or expense.' }),
  amount: amountInputSchema,
  date: z
    .string()
    .min(1, { error: 'Enter a date.', abort: true })
    .refine(isValidDate, { error: 'Enter a valid date.' }),
  category_id: z
    .string()
    .min(1, { error: 'Choose a category.' })
    .transform((id) => Number(id)),
  description: z
    .string()
    .trim()
    .max(200, { error: 'Use 200 characters or fewer.' })
    .transform((description) => (description === '' ? null : description)),
})

export type TransactionFormValues = z.input<typeof transactionFormSchema>
export type TransactionFormOutput = z.output<typeof transactionFormSchema>
