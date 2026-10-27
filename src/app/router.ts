import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, createRoute, retainSearchParams } from '@tanstack/react-router'
import { z } from 'zod'
import { budgetQueries } from '@/api/budget-queries'
import { categoryQueries } from '@/api/category-queries'
import { transactionQueries } from '@/api/transaction-queries'
import { TRANSACTION_SORTS } from '@/features/transactions/utils'
import { isValidMonth } from '@/utils/date'
import { transactionTypeSchema } from '@/types'
import { CategoriesPage } from './categories-page'
import { Layout } from './layout'
import { MonthPage } from './month-page'

const rootSearchSchema = z.object({
  fail: z.literal(1).optional().catch(undefined),
})

const monthSearchSchema = z.object({
  month: z.string().refine(isValidMonth).optional().catch(undefined),
  category: z.number().int().positive().optional().catch(undefined),
  type: transactionTypeSchema.optional().catch(undefined),
  q: z.coerce.string().optional().catch(undefined),
  sort: z.enum(TRANSACTION_SORTS).optional().catch(undefined),
})

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: rootSearchSchema,
  search: { middlewares: [retainSearchParams(['fail'])] },
  component: Layout,
})

const monthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: monthSearchSchema,
  // Starts all three loads together. Otherwise each useSuspenseQuery would wait for the one before it.
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(transactionQueries.list())
    void queryClient.prefetchQuery(categoryQueries.list())
    void queryClient.prefetchQuery(budgetQueries.list())
  },
  component: MonthPage,
})

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(categoryQueries.list())
    void queryClient.prefetchQuery(transactionQueries.list())
  },
  component: CategoriesPage,
})

export const routeTree = rootRoute.addChildren([monthRoute, categoriesRoute])
