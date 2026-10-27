import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getTransactions } from './transaction-services'

export const transactionQueries = {
  all: () => ['transactions'] as const,
  list: () =>
    queryOptions({
      queryKey: [...transactionQueries.all(), 'list'] as const,
      queryFn: getTransactions,
    }),
}

export function useTransactions() {
  return useSuspenseQuery(transactionQueries.list())
}
