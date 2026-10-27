import type { RefObject } from 'react'
import { useCreateCategory, useUpdateCategory } from '@/api/category-mutations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDialogFocus } from '@/hooks/use-dialog-focus'
import type { Category } from '@/types'
import type { CategoryFormValues } from '../schema'
import { CategoryForm } from './category-form'
import { DeleteCategoryButton } from './delete-category-button'

const NEW_CATEGORY_COLOR = '#2b6a8a'

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  categories: Category[]
  transactionCount: number
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  categories,
  transactionCount,
  fallbackFocusRef,
}: CategoryFormDialogProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const dialogFocus = useDialogFocus(fallbackFocusRef)
  const isSaving = createCategory.isPending || updateCategory.isPending
  const saveError = createCategory.error ?? updateCategory.error

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return
    if (!nextOpen) {
      createCategory.reset()
      updateCategory.reset()
    }
    onOpenChange(nextOpen)
  }

  const handleSave = (values: CategoryFormValues) => {
    const options = { onSuccess: () => handleOpenChange(false) }
    if (category) updateCategory.mutate({ id: category.id, ...values }, options)
    else createCategory.mutate(values, options)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSaving} {...dialogFocus}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {category ? 'Edit category' : 'Add category'}
          </DialogTitle>
          <DialogDescription>
            The name and color show in the transaction list and the summary.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={category?.id ?? 'new'}
          defaultValues={{
            name: category?.name ?? '',
            color: category?.color ?? NEW_CATEGORY_COLOR,
          }}
          categories={categories}
          exceptCategoryId={category?.id}
          isSaving={isSaving}
          saveError={saveError}
          submitLabel={category ? 'Save changes' : 'Add category'}
          onSave={handleSave}
          footerStart={
            category && (
              <DeleteCategoryButton
                category={category}
                transactionCount={transactionCount}
                disabled={isSaving}
                onDeleted={() => handleOpenChange(false)}
              />
            )
          }
        />
      </DialogContent>
    </Dialog>
  )
}
