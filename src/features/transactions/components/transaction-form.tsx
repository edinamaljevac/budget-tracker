import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { Controller, useForm, type DefaultValues } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category } from '@/types'
import {
  transactionFormSchema,
  type TransactionFormOutput,
  type TransactionFormValues,
} from '../schema'

type TransactionFormProps = {
  defaultValues: DefaultValues<TransactionFormValues>
  categories: Category[]
  isSaving: boolean
  saveError: Error | null
  submitLabel: string
  onSave: (values: TransactionFormOutput) => void
  footerStart: ReactNode
}

export function TransactionForm({
  defaultValues,
  categories,
  isSaving,
  saveError,
  submitLabel,
  onSave,
  footerStart,
}: TransactionFormProps) {
  const { control, register, handleSubmit, formState } = useForm<
    TransactionFormValues,
    unknown,
    TransactionFormOutput
  >({ resolver: zodResolver(transactionFormSchema), defaultValues })
  const { errors } = formState
  const sortedCategories = categories.toSorted((a, b) => a.name.localeCompare(b.name))

  return (
    <form noValidate onSubmit={handleSubmit(onSave)} className="grid gap-5">
      <Controller
        name="type"
        control={control}
        render={({ field, fieldState }) => (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend id="transaction-type-label" variant="label">
              Type
            </FieldLegend>
            <RadioGroup
              name={field.name}
              value={field.value ?? ''}
              onValueChange={field.onChange}
              aria-labelledby="transaction-type-label"
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? 'transaction-type-error' : undefined}
              className="flex gap-6"
            >
              <Field orientation="horizontal" className="w-auto">
                <RadioGroupItem ref={field.ref} id="transaction-type-expense" value="expense" />
                <FieldLabel htmlFor="transaction-type-expense" className="font-normal">
                  Expense
                </FieldLabel>
              </Field>
              <Field orientation="horizontal" className="w-auto">
                <RadioGroupItem id="transaction-type-income" value="income" />
                <FieldLabel htmlFor="transaction-type-income" className="font-normal">
                  Income
                </FieldLabel>
              </Field>
            </RadioGroup>
            <FieldError id="transaction-type-error" errors={[fieldState.error]} />
          </FieldSet>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="transaction-amount">Amount (€)</FieldLabel>
          <Input
            id="transaction-amount"
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'transaction-amount-error' : undefined}
            {...register('amount')}
          />
          <FieldError id="transaction-amount-error" errors={[errors.amount]} />
        </Field>

        <Field data-invalid={Boolean(errors.date)}>
          <FieldLabel htmlFor="transaction-date">Date</FieldLabel>
          <Input
            id="transaction-date"
            type="date"
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'transaction-date-error' : undefined}
            {...register('date')}
          />
          <FieldError id="transaction-date-error" errors={[errors.date]} />
        </Field>
      </div>

      <Controller
        name="category_id"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="transaction-category">Category</FieldLabel>
            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                ref={field.ref}
                id="transaction-category"
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'transaction-category-error' : undefined}
                className="w-full"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {sortedCategories.map((category) => (
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
            <FieldError id="transaction-category-error" errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Field data-invalid={Boolean(errors.description)}>
        <FieldLabel htmlFor="transaction-description">Description (optional)</FieldLabel>
        <Input
          id="transaction-description"
          autoComplete="off"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'transaction-description-error' : undefined}
          {...register('description')}
        />
        <FieldError id="transaction-description-error" errors={[errors.description]} />
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
