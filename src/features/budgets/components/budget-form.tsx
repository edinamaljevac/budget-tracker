import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category } from '@/types'
import { budgetFormSchema, type BudgetFormOutput, type BudgetFormValues } from '../schema'

type BudgetFormProps = {
  defaultValues: BudgetFormValues
  availableCategories: Category[] | null
  isSaving: boolean
  saveError: Error | null
  submitLabel: string
  onSave: (values: BudgetFormOutput) => void
  footerStart: ReactNode
}

export function BudgetForm({
  defaultValues,
  availableCategories,
  isSaving,
  saveError,
  submitLabel,
  onSave,
  footerStart,
}: BudgetFormProps) {
  const { control, register, handleSubmit, formState } = useForm<
    BudgetFormValues,
    unknown,
    BudgetFormOutput
  >({ resolver: zodResolver(budgetFormSchema), defaultValues })
  const { errors } = formState

  return (
    <form noValidate onSubmit={handleSubmit(onSave)} className="grid gap-5">
      {availableCategories && (
        <Controller
          name="category_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="budget-category">Category</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="budget-category"
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? 'budget-category-error' : undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories
                    .toSorted((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FieldError id="budget-category-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
      )}

      <Field data-invalid={Boolean(errors.amount)}>
        <FieldLabel htmlFor="budget-amount">Budget (€)</FieldLabel>
        <Input
          id="budget-amount"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? 'budget-amount-error' : undefined}
          {...register('amount')}
        />
        <FieldError id="budget-amount-error" errors={[errors.amount]} />
      </Field>

      {saveError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {saveError.message}
        </p>
      )}

      <DialogFooter>
        {footerStart}
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSaving} className="sm:ml-auto">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}
