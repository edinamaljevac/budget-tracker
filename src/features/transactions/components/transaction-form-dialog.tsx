import type { RefObject } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { useCreateTransaction, useUpdateTransaction } from '@/api/transaction-mutations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDialogFocus } from '@/hooks/use-dialog-focus'
import type { Category, Transaction } from '@/types'
import type { TransactionFormOutput, TransactionFormValues } from '../schema'
import { DeleteTransactionButton } from './delete-transaction-button'
import { TransactionForm } from './transaction-form'

type TransactionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  categories: Category[]
  defaultDate: string
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  defaultDate,
  fallbackFocusRef,
}: TransactionFormDialogProps) {
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const dialogFocus = useDialogFocus(fallbackFocusRef)
  const isSaving = createTransaction.isPending || updateTransaction.isPending
  const saveError = createTransaction.error ?? updateTransaction.error

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return
    if (!nextOpen) {
      createTransaction.reset()
      updateTransaction.reset()
    }
    onOpenChange(nextOpen)
  }

  const handleSave = (values: TransactionFormOutput) => {
    const options = { onSuccess: () => handleOpenChange(false) }
    if (transaction) updateTransaction.mutate({ id: transaction.id, ...values }, options)
    else createTransaction.mutate(values, options)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSaving} {...dialogFocus}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {transaction ? 'Edit transaction' : 'Add transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Change the details of this transaction.'
              : 'Record income or an expense.'}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          key={transaction?.id ?? 'new'}
          defaultValues={toFormValues(transaction, defaultDate)}
          categories={categories}
          isSaving={isSaving}
          saveError={saveError}
          submitLabel={transaction ? 'Save changes' : 'Add transaction'}
          onSave={handleSave}
          footerStart={
            transaction && (
              <DeleteTransactionButton
                transaction={transaction}
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

function toFormValues(
  transaction: Transaction | null,
  defaultDate: string,
): DefaultValues<TransactionFormValues> {
  if (!transaction) {
    return { amount: '', date: defaultDate, category_id: '', description: '' }
  }
  return {
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    category_id: String(transaction.category_id),
    description: transaction.description ?? '',
  }
}
