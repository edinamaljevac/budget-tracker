import { useState } from 'react'
import { useDeleteBudget } from '@/api/budget-mutations'
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
import { formatMonthLabel } from '@/utils/date'
import { formatMoney } from '@/utils/money'
import type { Category } from '@/types'

type RemoveBudgetButtonProps = {
  month: string
  category: Category
  budgetCents: number
  disabled: boolean
  onRemoved: () => void
}

export function RemoveBudgetButton({
  month,
  category,
  budgetCents,
  disabled,
  onRemoved,
}: RemoveBudgetButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteBudget = useDeleteBudget()
  const isRemoving = deleteBudget.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isRemoving) return
    if (!nextOpen) deleteBudget.reset()
    setOpen(nextOpen)
  }

  const handleRemove = () => {
    deleteBudget.mutate(
      { month, category_id: category.id },
      {
        onSuccess: () => {
          setOpen(false)
          onRemoved()
        },
      },
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={disabled}>
          Remove budget
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove the {category.name} budget?</AlertDialogTitle>
          <AlertDialogDescription>
            The budget of {formatMoney(budgetCents)} for {formatMonthLabel(month)} will be removed.
            The transactions stay as they are.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteBudget.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {deleteBudget.error.message}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isRemoving}
            onClick={(event) => {
              event.preventDefault()
              handleRemove()
            }}
          >
            {isRemoving ? 'Removing…' : 'Remove budget'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
