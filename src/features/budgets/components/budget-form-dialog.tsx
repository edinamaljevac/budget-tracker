import type { RefObject } from 'react'
import { useSaveBudget } from '@/api/budget-mutations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDialogFocus } from '@/hooks/use-dialog-focus'
import type { Category } from '@/types'
import { formatMonthLabel } from '@/utils/date'
import { centsToAmount } from '@/utils/money'
import type { BudgetFormOutput } from '../schema'
import { BudgetForm } from './budget-form'
import { RemoveBudgetButton } from './remove-budget-button'

type BudgetFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  month: string
  category: Category | null
  budgetCents: number | null
  availableCategories: Category[]
  fallbackFocusRef: RefObject<HTMLElement | null>
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  month,
  category,
  budgetCents,
  availableCategories,
  fallbackFocusRef,
}: BudgetFormDialogProps) {
  const saveBudget = useSaveBudget()
  const dialogFocus = useDialogFocus(fallbackFocusRef)
  const isSaving = saveBudget.isPending
  const isChange = category !== null && budgetCents !== null
  const monthLabel = formatMonthLabel(month)

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return
    if (!nextOpen) saveBudget.reset()
    onOpenChange(nextOpen)
  }

  const handleSave = (values: BudgetFormOutput) => {
    saveBudget.mutate({ month, ...values }, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSaving} {...dialogFocus}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isChange ? 'Change budget' : 'Set budget'}
          </DialogTitle>
          <DialogDescription>
            {isChange
              ? `${category.name}, ${monthLabel}`
              : `Plan how much to spend in one category in ${monthLabel}.`}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          key={`${category?.id ?? 'new'}-${isChange ? 'change' : 'set'}`}
          defaultValues={{
            category_id: category ? String(category.id) : '',
            amount: budgetCents === null ? '' : centsToAmount(budgetCents),
          }}
          availableCategories={isChange ? null : availableCategories}
          isSaving={isSaving}
          saveError={saveBudget.error}
          submitLabel={isChange ? 'Save budget' : 'Set budget'}
          onSave={handleSave}
          footerStart={
            isChange && (
              <RemoveBudgetButton
                month={month}
                category={category}
                budgetCents={budgetCents}
                disabled={isSaving}
                onRemoved={() => handleOpenChange(false)}
              />
            )
          }
        />
      </DialogContent>
    </Dialog>
  )
}
