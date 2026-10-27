import { z } from 'zod'
import { isValidDate, isValidMonth } from '@/utils/date'
import { isValidAmount } from '@/utils/money'

const idSchema = z.number().int().positive()
const amountSchema = z.string().refine(isValidAmount)

export const transactionTypeSchema = z.enum(['income', 'expense'])

const categorySchema = z.strictObject({
  id: idSchema,
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})

const transactionSchema = z.strictObject({
  id: idSchema,
  type: transactionTypeSchema,
  amount: amountSchema,
  date: z.string().refine(isValidDate),
  description: z.string().max(200).nullable(),
  category_id: idSchema,
})

const budgetSchema = z.strictObject({
  month: z.string().refine(isValidMonth),
  category_id: idSchema,
  amount: amountSchema,
})

export const budgetDataSchema = z.strictObject({
  categories: z.array(categorySchema),
  transactions: z.array(transactionSchema),
  budgets: z.array(budgetSchema),
})

export type TransactionType = z.infer<typeof transactionTypeSchema>
export type Category = z.infer<typeof categorySchema>
export type Transaction = z.infer<typeof transactionSchema>
export type Budget = z.infer<typeof budgetSchema>
export type BudgetData = z.infer<typeof budgetDataSchema>
