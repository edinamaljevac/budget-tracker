import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Category, Transaction } from '@/types'
import { countTransactionsByCategory } from '../utils'
import { CategoryFormDialog } from './category-form-dialog'
import { CategoryList } from './category-list'

type CategoriesSectionProps = {
  categories: Category[]
  transactions: Transaction[]
}

type FormState = {
  open: boolean
  category: Category | null
}

export function CategoriesSection({ categories, transactions }: CategoriesSectionProps) {
  const [form, setForm] = useState<FormState>({ open: false, category: null })
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const transactionCounts = countTransactionsByCategory(transactions)

  return (
    <section aria-label="Category list" className="flex flex-col gap-4">
      <Button
        ref={addButtonRef}
        className="self-start"
        onClick={() => setForm({ open: true, category: null })}
      >
        <Plus aria-hidden="true" />
        Add category
      </Button>
      <CategoryList
        categories={categories}
        transactionCounts={transactionCounts}
        onEdit={(category) => setForm({ open: true, category })}
      />

      <CategoryFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((previous) => ({ ...previous, open }))}
        category={form.category}
        categories={categories}
        transactionCount={form.category ? (transactionCounts.get(form.category.id) ?? 0) : 0}
        fallbackFocusRef={addButtonRef}
      />
    </section>
  )
}
