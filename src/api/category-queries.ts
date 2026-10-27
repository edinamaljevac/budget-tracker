import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getCategories } from './category-services'

export const categoryQueries = {
  all: () => ['categories'] as const,
  list: () =>
    queryOptions({
      queryKey: [...categoryQueries.all(), 'list'] as const,
      queryFn: getCategories,
    }),
}

export function useCategories() {
  return useSuspenseQuery(categoryQueries.list())
}
