import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getBudgets } from './budget-services'

export const budgetQueries = {
  all: () => ['budgets'] as const,
  list: () =>
    queryOptions({
      queryKey: [...budgetQueries.all(), 'list'] as const,
      queryFn: getBudgets,
    }),
}

export function useBudgets() {
  return useSuspenseQuery(budgetQueries.list())
}
