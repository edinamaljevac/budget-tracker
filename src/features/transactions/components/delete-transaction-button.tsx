import { useState } from 'react'
import { useDeleteTransaction } from '@/api/transaction-mutations'
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
import { formatDayLabel } from '@/utils/date'
import { formatMoney, toCents } from '@/utils/money'
import type { Transaction } from '@/types'

type DeleteTransactionButtonProps = {
  transaction: Transaction
  disabled: boolean
  onDeleted: () => void
}

export function DeleteTransactionButton({
  transaction,
  disabled,
  onDeleted,
}: DeleteTransactionButtonProps) {
  const [open, setOpen] = useState(false)
  const deleteTransaction = useDeleteTransaction()
  const isDeleting = deleteTransaction.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return
    if (!nextOpen) deleteTransaction.reset()
    setOpen(nextOpen)
  }

  const handleDelete = () => {
    deleteTransaction.mutate(transaction.id, {
      onSuccess: () => {
        setOpen(false)
        onDeleted()
      },
    })
  }

  const summary = `${transaction.description?.trim() || 'No description'}, ${formatDayLabel(transaction.date)}, ${formatMoney(toCents(transaction.amount))}`

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={disabled}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            {summary}. The list and summary will no longer include it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteTransaction.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {deleteTransaction.error.message}
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
            {isDeleting ? 'Deleting…' : 'Delete transaction'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
