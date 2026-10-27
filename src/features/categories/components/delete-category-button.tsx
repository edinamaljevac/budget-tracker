import { useState } from 'react'
import { useDeleteCategory } from '@/api/category-mutations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types'

type DeleteCategoryButtonProps = {
  category: Category
  transactionCount: number
  disabled: boolean
  onDeleted: () => void
}

export function DeleteCategoryButton({
  category,
  transactionCount,
  disabled,
  onDeleted,
}: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteCategory = useDeleteCategory()
  const isDeleting = deleteCategory.isPending
  const hasTransactions = transactionCount > 0
  const transactionWord = transactionCount === 1 ? 'transaction' : 'transactions'
  const blockedReason = `It has ${transactionCount} ${transactionWord}. Delete them or move them to another category first.`

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return
    if (!nextOpen) deleteCategory.reset()
    setOpen(nextOpen)
  }

  const handleDelete = () => {
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        setOpen(false)
        onDeleted()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={disabled}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {hasTransactions ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{category.name} cannot be deleted</AlertDialogTitle>
              <AlertDialogDescription>{blockedReason}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Its budgets in every month are deleted too.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteCategory.error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {deleteCategory.error.message}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={(event) => {
                  event.preventDefault()
                  handleDelete()
                }}
              >
                {isDeleting ? 'Deleting…' : 'Delete category'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
