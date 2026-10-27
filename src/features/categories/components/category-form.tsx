import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { Category } from '@/types'
import { createCategoryFormSchema, type CategoryFormValues } from '../schema'

type CategoryFormProps = {
  defaultValues: CategoryFormValues
  categories: Category[]
  exceptCategoryId: number | undefined
  isSaving: boolean
  saveError: Error | null
  submitLabel: string
  onSave: (values: CategoryFormValues) => void
  footerStart: ReactNode
}

export function CategoryForm({
  defaultValues,
  categories,
  exceptCategoryId,
  isSaving,
  saveError,
  submitLabel,
  onSave,
  footerStart,
}: CategoryFormProps) {
  const { control, register, handleSubmit, formState } = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategoryFormSchema(categories, exceptCategoryId)),
    defaultValues,
  })
  const { errors } = formState

  return (
    <form noValidate onSubmit={handleSubmit(onSave)} className="grid gap-5">
      <Field data-invalid={Boolean(errors.name)}>
        <FieldLabel htmlFor="category-name">Name</FieldLabel>
        <Input
          id="category-name"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'category-name-error' : undefined}
          {...register('name')}
        />
        <FieldError id="category-name-error" errors={[errors.name]} />
      </Field>

      <Controller
        name="color"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="category-color">Color</FieldLabel>
            <div>
              <Input
                {...field}
                id="category-color"
                type="color"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'category-color-error' : undefined}
                className="h-10 w-20 cursor-pointer p-1"
              />
            </div>
            <FieldError id="category-color-error" errors={[fieldState.error]} />
          </Field>
        )}
      />

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
