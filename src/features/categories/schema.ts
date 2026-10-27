import { z } from 'zod'
import type { Category } from '@/types'
import { isCategoryNameTaken } from '@/utils/categories'

export function createCategoryFormSchema(categories: Category[], exceptCategoryId?: number) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Enter a name.', abort: true })
      .max(30, { error: 'Use 30 characters or fewer.', abort: true })
      .refine((name) => !isCategoryNameTaken(categories, name, exceptCategoryId), {
        error: 'A category with this name already exists.',
      }),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: 'Choose a color.' }),
  })
}

export type CategoryFormValues = z.input<ReturnType<typeof createCategoryFormSchema>>
