import { useCategories } from '@/api/category-queries'
import { useTransactions } from '@/api/transaction-queries'
import { CategoriesSection } from '@/features/categories/components/categories-section'

export function CategoriesContent() {
  const { data: categories } = useCategories()
  const { data: transactions } = useTransactions()

  return <CategoriesSection categories={categories} transactions={transactions} />
}
