import { getRouteApi, useRouterState } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { transactionTypeSchema, type Category } from '@/types'
import { DEFAULT_SORT, TRANSACTION_SORTS, type TransactionSort } from '../utils'
import { SearchField } from './search-field'

const monthRoute = getRouteApi('/')

const ALL = 'all'

const SORT_LABELS: Record<TransactionSort, string> = {
  'date-desc': 'Newest first',
  'date-asc': 'Oldest first',
  'amount-desc': 'Highest amount',
  'amount-asc': 'Lowest amount',
}

type TransactionFiltersProps = {
  categories: Category[]
  categoryId: number | undefined
}

export function TransactionFilters({ categories, categoryId }: TransactionFiltersProps) {
  const { type, q, sort } = monthRoute.useSearch()
  const navigate = monthRoute.useNavigate()
  const hasFilters = categoryId !== undefined || type !== undefined || Boolean(q)

  const historyIndex = useRouterState({
    select: (state) => state.resolvedLocation?.state.__TSR_index,
  })

  const sortedCategories = categories.toSorted((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SearchField
        key={historyIndex}
        initialText={q ?? ''}
        onSearch={(text) =>
          void navigate({
            search: (previous) => ({ ...previous, q: text === '' ? undefined : text }),
            replace: true,
          })
        }
      />

      <div className="grid gap-1.5">
        <Label htmlFor="category-filter">Category</Label>
        <Select
          value={categoryId === undefined ? ALL : String(categoryId)}
          onValueChange={(value) =>
            void navigate({
              search: (previous) => ({
                ...previous,
                category: value === ALL ? undefined : Number(value),
              }),
            })
          }
        >
          <SelectTrigger id="category-filter" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {sortedCategories.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="type-filter">Type</Label>
        <Select
          value={type ?? ALL}
          onValueChange={(value) =>
            void navigate({
              search: (previous) => ({
                ...previous,
                type: transactionTypeSchema.safeParse(value).data,
              }),
            })
          }
        >
          <SelectTrigger id="type-filter" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="transaction-sort">Sort</Label>
        <Select
          value={sort ?? DEFAULT_SORT}
          onValueChange={(value) => {
            const nextSort = TRANSACTION_SORTS.find((item) => item === value)
            void navigate({
              search: (previous) => ({
                ...previous,
                sort: nextSort === DEFAULT_SORT ? undefined : nextSort,
              }),
            })
          }}
        >
          <SelectTrigger id="transaction-sort" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_SORTS.map((item) => (
              <SelectItem key={item} value={item}>
                {SORT_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          className="justify-self-start sm:col-span-2 xl:col-span-4"
          onClick={() =>
            void navigate({
              search: (previous) => ({
                ...previous,
                category: undefined,
                type: undefined,
                q: undefined,
              }),
            })
          }
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
