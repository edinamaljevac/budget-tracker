import type { Category } from '@/types'

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

export function isCategoryNameTaken(
  categories: Category[],
  name: string,
  exceptCategoryId?: number,
): boolean {
  const normalizedName = normalizeName(name)
  return categories.some(
    (category) =>
      category.id !== exceptCategoryId && normalizeName(category.name) === normalizedName,
  )
}
