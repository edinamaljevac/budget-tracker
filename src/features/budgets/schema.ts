import { z } from 'zod'
import { amountInputSchema } from '@/utils/money'

export const budgetFormSchema = z.object({
  category_id: z
    .string()
    .min(1, { error: 'Choose a category.' })
    .transform((id) => Number(id)),
  amount: amountInputSchema,
})

export type BudgetFormValues = z.input<typeof budgetFormSchema>
export type BudgetFormOutput = z.output<typeof budgetFormSchema>
